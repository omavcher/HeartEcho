const TrackingEvent = require('../models/TrackingEvent');

exports.recordEvent = async (req, res) => {
  try {
    const { events } = req.body;
    if (!events || !Array.isArray(events)) {
      return res.status(400).json({ error: 'Events array is required' });
    }
// 
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const formattedEvents = events.map(ev => ({
      user: ev.userId && ev.userId !== 'null' ? ev.userId : null,
      sessionId: ev.sessionId,
      eventType: ev.eventType,
      path: ev.path,
      eventData: ev.eventData || {},
      url: ev.url,
      userAgent: req.headers['user-agent'],
      referrer: ev.referrer,
      deviceType: ev.deviceType,
      ip: ip,
      createdAt: ev.timestamp ? new Date(ev.timestamp) : Date.now()
    }));

    await TrackingEvent.insertMany(formattedEvents);
    res.status(200).json({ success: true, count: events.length });
  } catch (error) {
    console.error("Tracking Error:", error);
    res.status(500).json({ error: 'Server error saving events' });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, eventType, page = 1, limit = 50 } = req.query;
    
    let query = {};
    if (startDate && endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: endOfDay
      };
    }
    if (eventType) {
      query.eventType = eventType;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // 1. Total Count for pagination
    const totalEventsExtracted = await TrackingEvent.countDocuments(query);

    // 2. Fetch paginated recent events, populate User info
    const recentEvents = await TrackingEvent.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name email user_type profile_picture');

    // 3. Event Counts
    const eventCounts = await TrackingEvent.aggregate([
      { $match: query },
      { $group: { _id: "$eventType", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // 4. Time Series daily aggregation
    const timeSeriesData = await TrackingEvent.aggregate([
      { $match: query },
      { 
        $group: { 
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { _id: 1 } }
    ]);

    // 5. Device distribution
    const deviceStats = await TrackingEvent.aggregate([
      { $match: query },
      { $group: { _id: "$deviceType", count: { $sum: 1 } } }
    ]);

    // 6. User Paid vs Free mapping
    const userStats = await TrackingEvent.aggregate([
      { $match: query },
      { $match: { user: { $ne: null } } },
      { 
         $lookup: {
             from: 'users',
             localField: 'user',
             foreignField: '_id',
             as: 'userData'
         }
      },
      { $unwind: "$userData" },
      {
         $group: {
             _id: "$userData.user_type",
             count: { $sum: 1 }
         }
      }
    ]);

    // 7. Extract Top UTM Campaigns/Sources (looking directly at eventData keys matching utm)
    const sourceStats = await TrackingEvent.aggregate([
      { $match: { ...query, "eventData.utm_source": { $exists: true } } },
      { $group: { _id: "$eventData.utm_source", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Funnel stats
    const funnelStats = await TrackingEvent.aggregate([
      { $match: query },
      { $group: { _id: { sessionId: "$sessionId", eventType: "$eventType" } } },
      { $group: { _id: "$_id.eventType", uniqueSessions: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalEventsExtracted,
        eventCounts,
        funnelStats,
        timeSeriesData,
        deviceStats,
        userStats,
        sourceStats,
        recentEvents,
        totalPages: Math.ceil(totalEventsExtracted / parseInt(limit)) || 1,
        currentPage: parseInt(page)
      }
    });

  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ error: 'Server error fetching analytics' });
  }
};
