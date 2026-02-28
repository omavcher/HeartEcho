const TrackingEvent = require('../models/TrackingEvent');

exports.recordEvent = async (req, res) => {
  try {
    const { events } = req.body;
    if (!events || !Array.isArray(events)) {
      return res.status(400).json({ error: 'Events array is required' });
    }

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
    const { startDate, endDate, eventType } = req.query;
    
    let query = {};
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (eventType) {
      query.eventType = eventType;
    }

    const events = await TrackingEvent.find(query).sort({ createdAt: -1 }).limit(5000);
    
    // Aggregate by eventType
    const eventCounts = await TrackingEvent.aggregate([
      { $match: query },
      { $group: { _id: "$eventType", count: { $sum: 1 } } }
    ]);
    
    // Funnel stats (Example Funnel: PageView -> InitiateCheckout -> Signup/Purchase)
    const funnelStats = await TrackingEvent.aggregate([
      { $match: query },
      { $group: { _id: { sessionId: "$sessionId", eventType: "$eventType" } } },
      { $group: { _id: "$_id.eventType", uniqueSessions: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalEventsExtracted: events.length,
        eventCounts,
        funnelStats,
        recentEvents: events.slice(0, 100)
      }
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ error: 'Server error fetching analytics' });
  }
};
