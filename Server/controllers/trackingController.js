const TrackingEvent = require('../models/TrackingEvent');
const User = require('../models/User');
const Payment = require('../models/Payment');

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

    const [
      totalEventsExtracted,
      recentEvents,
      eventCounts,
      timeSeriesData,
      deviceStats,
      userStats,
      sourceStats,
      funnelStats,
      // --- NEW: Enhanced Marketing Analytics ---
      adTrafficBreakdown,
      utmCampaignStats,
      landingPageStats,
      conversionFunnelSessions,
      topConvertedLandingPages,
      dailyAdVsOrganicStats,
    ] = await Promise.all([
      // 1. Total Count
      TrackingEvent.countDocuments(query),

      // 2. Paginated recent events
      TrackingEvent.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('user', 'name email user_type profile_picture joinedAt'),

      // 3. Event type counts
      TrackingEvent.aggregate([
        { $match: query },
        { $group: { _id: "$eventType", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),

      // 4. Time series daily aggregation
      TrackingEvent.aggregate([
        { $match: query },
        { 
          $group: { 
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, 
            count: { $sum: 1 } 
          } 
        },
        { $sort: { _id: 1 } }
      ]),

      // 5. Device distribution
      TrackingEvent.aggregate([
        { $match: query },
        { $group: { _id: "$deviceType", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),

      // 6. User Paid vs Free behavior stats
      TrackingEvent.aggregate([
        { $match: { ...query, user: { $ne: null } } },
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
      ]),

      // 7. Top UTM Sources
      TrackingEvent.aggregate([
        { $match: { ...query, "eventData.utm_source": { $exists: true } } },
        { $group: { _id: "$eventData.utm_source", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),

      // 8. Funnel stats by session
      TrackingEvent.aggregate([
        { $match: query },
        { $group: { _id: { sessionId: "$sessionId", eventType: "$eventType" } } },
        { $group: { _id: "$_id.eventType", uniqueSessions: { $sum: 1 } } },
        { $sort: { uniqueSessions: -1 } }
      ]),

      // 9. AD Traffic: FB Ads (fbclid) vs Organic vs UTM campaigns
      TrackingEvent.aggregate([
        { $match: query },
        {
          $group: {
            _id: {
              $cond: [
                { $gt: [{ $size: { $filter: { input: { $objectToArray: { $ifNull: ["$eventData", {}] } }, as: "kv", cond: { $eq: ["$$kv.k", "fbclid"] } } } }, 0] },
                "Facebook Ads",
                {
                  $cond: [
                    { $gt: [{ $ifNull: ["$eventData.utm_medium", null] }, null] },
                    {
                      $concat: [
                        { $ifNull: ["$eventData.utm_source", "unknown"] },
                        " / ",
                        { $ifNull: ["$eventData.utm_medium", "unknown"] }
                      ]
                    },
                    {
                      $cond: [
                        { $and: [{ $ifNull: ["$referrer", false] }, { $ne: ["$referrer", ""] }] },
                        "Organic / Referral",
                        "Direct"
                      ]
                    }
                  ]
                }
              ]
            },
            sessions: { $addToSet: "$sessionId" },
            events: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 1,
            events: 1,
            uniqueSessions: { $size: "$sessions" }
          }
        },
        { $sort: { uniqueSessions: -1 } }
      ]),

      // 10. UTM Campaign breakdown (for FB Ads marketing)
      TrackingEvent.aggregate([
        {
          $match: {
            ...query,
            $or: [
              { "eventData.utm_campaign": { $exists: true, $ne: null } },
              { "eventData.utm_source": { $exists: true, $ne: null } }
            ]
          }
        },
        {
          $group: {
            _id: {
              campaign: { $ifNull: ["$eventData.utm_campaign", "unknown"] },
              source: { $ifNull: ["$eventData.utm_source", "unknown"] },
              medium: { $ifNull: ["$eventData.utm_medium", "unknown"] }
            },
            sessions: { $addToSet: "$sessionId" },
            events: { $sum: 1 },
            users: { $addToSet: "$user" }
          }
        },
        {
          $project: {
            _id: 1,
            events: 1,
            uniqueSessions: { $size: "$sessions" },
            uniqueUsers: { $size: "$users" }
          }
        },
        { $sort: { uniqueSessions: -1 } },
        { $limit: 20 }
      ]),

      // 11. Landing pages (first page visited per session)
      TrackingEvent.aggregate([
        { $match: { ...query, eventType: "page_view" } },
        { $sort: { createdAt: 1 } },
        {
          $group: {
            _id: "$sessionId",
            landingPage: { $first: "$path" },
            source: { $first: "$eventData.utm_source" },
            hasFbclid: { $first: "$eventData.fbclid" },
            userId: { $first: "$user" }
          }
        },
        {
          $group: {
            _id: "$landingPage",
            sessions: { $sum: 1 },
            adSessions: { $sum: { $cond: [{ $ne: ["$hasFbclid", null] }, 1, 0] } },
            uniqueUsers: { $addToSet: "$userId" }
          }
        },
        {
          $project: {
            _id: 1,
            sessions: 1,
            adSessions: 1,
            uniqueUsers: { $size: "$uniqueUsers" }
          }
        },
        { $sort: { sessions: -1 } },
        { $limit: 15 }
      ]),

      // 12. Full Conversion Funnel: visitor → login → subscriber
      //     Track distinct sessions through stages
      (async () => {
        // Sessions that had page_view (all visitors)
        const visitors = await TrackingEvent.distinct('sessionId', { ...query, eventType: 'page_view' });
        // Sessions with login
        const loggedIn = await TrackingEvent.distinct('sessionId', { ...query, eventType: 'login_success' });
        // Sessions with signup
        const signedUp = await TrackingEvent.distinct('sessionId', { ...query, eventType: 'signup_complete' });
        // Sessions with checkout initiated
        const checkoutInit = await TrackingEvent.distinct('sessionId', { ...query, eventType: 'initiate_checkout' });
        // Sessions with subscription purchase (subscription_purchase event)
        const purchased = await TrackingEvent.distinct('sessionId', { ...query, eventType: 'subscription_purchase' });

        // Users who converted from free → paid (based on user data + payment model)
        const paidUserCount = await User.countDocuments({ user_type: 'subscriber' });
        const freeUserCount = await User.countDocuments({ user_type: 'free' });
        const totalUsers = await User.countDocuments();
        const recentPaidUsers = await Payment.countDocuments({
          date: query.createdAt ? { $gte: query.createdAt.$gte, $lte: query.createdAt.$lte } : { $exists: true }
        });

        return {
          visitors: visitors.length,
          loggedIn: loggedIn.length,
          signedUp: signedUp.length,
          checkoutInit: checkoutInit.length,
          purchased: purchased.length,
          paidUserCount,
          freeUserCount,
          totalUsers,
          recentPaidUsers
        };
      })(),

      // 13. Landing pages that converted to subscription (sessions with both page_view AND subscription_purchase)
      TrackingEvent.aggregate([
        { $match: query },
        {
          $group: {
            _id: "$sessionId",
            events: { $push: { type: "$eventType", path: "$path" } },
            landingPage: { $first: "$path" },
            userId: { $first: "$user" }
          }
        },
        {
          $match: {
            "events.type": "subscription_purchase"
          }
        },
        {
          $group: {
            _id: "$landingPage",
            conversions: { $sum: 1 }
          }
        },
        { $sort: { conversions: -1 } },
        { $limit: 10 }
      ]),

      // 14. Daily breakdown of ad traffic vs organic
      TrackingEvent.aggregate([
        { $match: query },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              isAd: {
                $cond: [
                  {
                    $or: [
                      { $gt: [{ $ifNull: ["$eventData.fbclid", null] }, null] },
                      { $eq: ["$eventData.utm_medium", "cpc"] },
                      { $eq: ["$eventData.utm_medium", "paid"] }
                    ]
                  },
                  "ad",
                  "organic"
                ]
              }
            },
            events: { $sum: 1 },
            sessions: { $addToSet: "$sessionId" }
          }
        },
        {
          $group: {
            _id: "$_id.date",
            data: {
              $push: {
                type: "$_id.isAd",
                events: "$events",
                sessions: { $size: "$sessions" }
              }
            }
          }
        },
        { $sort: { _id: 1 } }
      ])
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
        currentPage: parseInt(page),
        // New marketing data
        adTrafficBreakdown,
        utmCampaignStats,
        landingPageStats,
        conversionFunnelSessions,
        topConvertedLandingPages,
        dailyAdVsOrganicStats
      }
    });

  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ error: 'Server error fetching analytics' });
  }
};
