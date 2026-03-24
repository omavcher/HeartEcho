const TrackingEvent = require('../models/TrackingEvent');
const User = require('../models/User');
const Payment = require('../models/Payment');

// ─── Sanitize eventData: strip amp; prefix from UTM keys, infer utm_source ───
const sanitizeEventData = (raw = {}) => {
  const out = {};
  for (const [key, val] of Object.entries(raw)) {
    const clean = key.replace(/^amp;/, '');
    out[clean] = val;
  }
  // Infer utm_source when campaign/medium present but source missing
  if ((out.utm_campaign || out.utm_medium) && !out.utm_source) {
    const camp = (out.utm_campaign || '').toLowerCase();
    if (camp.includes('fb') || camp.includes('facebook')) out.utm_source = 'facebook';
    else if (camp.includes('ig') || camp.includes('instagram')) out.utm_source = 'instagram';
    else if (camp.includes('google') || camp.includes('goog')) out.utm_source = 'google';
    else out.utm_source = 'paid_ad';
  }
  return out;
};

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
      eventData: sanitizeEventData(ev.eventData || {}),
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

    // Build date query
    let query = {};
    if (startDate && endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      query.createdAt = { $gte: new Date(startDate), $lte: endOfDay };
    }
    if (eventType) query.eventType = eventType;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitInt = parseInt(limit);

    // ─── Run ALL queries in parallel ─────────────────────────────────────────
    const [
      totalEventsExtracted,
      recentEvents,
      eventCounts,
      timeSeriesData,
      deviceStats,
      userTypeCounts,
      utmSourceStats,
      funnelByEvent,
      // Conversion funnel counts (cheap countDocuments)
      visitorCount,
      loginCount,
      signupCount,
      checkoutCount,
      purchaseCount,
      paidUserCount,
      freeUserCount,
      totalUsers,
      recentPaidUsers,
      // Landing pages — lightweight: pre-limit then group
      landingPageStats,
      // Ad source: count by utm_source (cheap field group)
      adSourceStats,
      // UTM campaign stats — lightweight sum counts only
      utmCampaignStats,
      // Daily time series
      dailyAdStats,
      dailyOrganicStats,
      // User journey — strict limit BEFORE group to avoid OOM
      userJourney,
    ] = await Promise.all([

      // 1. Total count
      TrackingEvent.countDocuments(query),

      // 2. Paginated recent events (populate user)
      TrackingEvent.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitInt)
        .populate('user', 'name email user_type profile_picture'),

      // 3. Event type counts — simple group, no addToSet
      TrackingEvent.aggregate([
        { $match: query },
        { $group: { _id: '$eventType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 15 }
      ]),

      // 4. Time series daily — simple group
      TrackingEvent.aggregate([
        { $match: query },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $limit: 90 }
      ]),

      // 5. Device stats
      TrackingEvent.aggregate([
        { $match: query },
        { $group: { _id: '$deviceType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),

      // 6. User type counts (events by user type) — uses simple $cond on joined field
      //    Done as two cheap countDocuments instead of heavy lookup
      TrackingEvent.aggregate([
        { $match: { ...query, user: { $ne: null } } },
        { $group: { _id: '$user', count: { $sum: 1 } } },
        { $limit: 5000 }, // cap to avoid OOM
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'u',
            pipeline: [{ $project: { user_type: 1 } }]
          }
        },
        { $unwind: { path: '$u', preserveNullAndEmptyArrays: true } },
        { $group: { _id: { $ifNull: ['$u.user_type', 'unknown'] }, count: { $sum: '$count' } } }
      ]),

      // 7. UTM source stats — match only docs with utm_source to reduce scan
      TrackingEvent.aggregate([
        { $match: { ...query, 'eventData.utm_source': { $exists: true, $ne: null } } },
        { $group: { _id: '$eventData.utm_source', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),

      // 8. Funnel by unique sessions per event type — two-stage group
      TrackingEvent.aggregate([
        { $match: query },
        { $group: { _id: { s: '$sessionId', e: '$eventType' } } },
        { $group: { _id: '$_id.e', uniqueSessions: { $sum: 1 } } },
        { $sort: { uniqueSessions: -1 } },
        { $limit: 15 }
      ]),

      // 9-15. Conversion funnel — unique USERS per stage (not raw event counts)
      // Stage 1: Unique users who visited (total registered users ever)
      User.countDocuments(),
      // Stage 2: Unique users who signed up within the date range
      User.countDocuments(
        query.createdAt
          ? { createdAt: { $gte: query.createdAt.$gte, $lte: query.createdAt.$lte } }
          : {}
      ),
      // Stage 3: Unique users who logged in (distinct user IDs from login events)
      TrackingEvent.distinct('user', { ...query, eventType: 'login_success', user: { $ne: null } }).then(r => r.length),
      // Stage 4: Unique users who sent a chat message (quota used)
      TrackingEvent.distinct('user', { ...query, eventType: 'chat_message_sent', user: { $ne: null } }).then(r => r.length),
      // Stage 5: Paid subscribers (all time, not filtered by date)
      User.countDocuments({ user_type: 'subscriber' }),
      // Extra stats
      User.countDocuments({ user_type: 'subscriber' }),
      User.countDocuments({ user_type: 'free' }),
      User.countDocuments(),
      Payment.countDocuments(
        query.createdAt
          ? { date: { $gte: query.createdAt.$gte, $lte: query.createdAt.$lte } }
          : {}
      ),

      // 16. Landing pages — group by path after sorting + limiting to 2000 recent page_views
      TrackingEvent.aggregate([
        { $match: { ...query, eventType: 'page_view' } },
        { $sort: { createdAt: -1 } },
        { $limit: 2000 },
        { $group: { _id: '$path', sessions: { $sum: 1 }, adSessions: { $sum: { $cond: [{ $ne: ['$eventData.fbclid', null] }, 1, 0] } }, uniqueUsers: { $sum: { $cond: [{ $ne: ['$user', null] }, 1, 0] } } } },
        { $sort: { sessions: -1 } },
        { $limit: 15 }
      ]),

      // 17. Ad source breakdown — group by utm_source, mark fb if fbclid present
      TrackingEvent.aggregate([
        { $match: { ...query, $or: [{ 'eventData.utm_source': { $exists: true, $ne: null } }, { 'eventData.fbclid': { $exists: true, $ne: null } }] } },
        { $limit: 3000 },
        {
          $group: {
            _id: {
              $cond: [
                { $ne: [{ $ifNull: ['$eventData.fbclid', null] }, null] },
                'Facebook Ads',
                { $ifNull: ['$eventData.utm_source', 'Direct'] }
              ]
            },
            events: { $sum: 1 },
            uniqueSessions: { $sum: 1 }
          }
        },
        { $sort: { uniqueSessions: -1 } },
        { $limit: 10 }
      ]),

      // 18. UTM campaign stats — simple count per campaign (no addToSet)
      TrackingEvent.aggregate([
        { $match: { ...query, 'eventData.utm_campaign': { $exists: true, $ne: null } } },
        { $limit: 2000 },
        {
          $group: {
            _id: {
              campaign: '$eventData.utm_campaign',
              source: { $ifNull: ['$eventData.utm_source', 'unknown'] },
              medium: { $ifNull: ['$eventData.utm_medium', 'unknown'] }
            },
            events: { $sum: 1 },
            uniqueSessions: { $sum: 1 },
            uniqueUsers: { $sum: { $cond: [{ $ne: ['$user', null] }, 1, 0] } }
          }
        },
        { $sort: { uniqueSessions: -1 } },
        { $limit: 20 }
      ]),

      // 19. Daily ad sessions (has fbclid or utm_medium=paid/cpc)
      TrackingEvent.aggregate([
        { $match: { ...query, $or: [{ 'eventData.fbclid': { $ne: null, $exists: true } }, { 'eventData.utm_medium': 'paid' }, { 'eventData.utm_medium': 'cpc' }] } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, sessions: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $limit: 90 }
      ]),

      // 20. Daily organic sessions (no fbclid, no paid utm)
      TrackingEvent.aggregate([
        { $match: { ...query, 'eventData.fbclid': { $exists: false }, 'eventData.utm_medium': { $nin: ['paid', 'cpc'] } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, sessions: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $limit: 90 }
      ]),

      // 21. User Journey — MUST limit docs BEFORE grouping to avoid OOM
      TrackingEvent.aggregate([
        { $match: query },
        { $sort: { createdAt: -1 } },
        { $limit: 3000 },                            // hard cap BEFORE $group
        { $sort: { createdAt: 1 } },                 // re-sort asc so $first/$last are correct
        {
          $group: {
            _id: { $ifNull: ['$user', '$sessionId'] },
            userId:       { $first: '$user' },
            sessionId:    { $first: '$sessionId' },
            totalEvents:  { $sum: 1 },
            eventTypes:   { $addToSet: '$eventType' }, // small: max ~8 unique values
            landingPage:  { $first: '$path' },
            lastPage:     { $last: '$path' },
            firstSeen:    { $min: '$createdAt' },
            lastSeen:     { $max: '$createdAt' },
            deviceType:   { $first: '$deviceType' },
            ip:           { $first: '$ip' },
            referrer:     { $first: '$referrer' },
            utmSource:    { $first: '$eventData.utm_source' },
            utmCampaign:  { $first: '$eventData.utm_campaign' },
            utmMedium:    { $first: '$eventData.utm_medium' },
            hasFbclid:    { $max: { $cond: [{ $ne: [{ $ifNull: ['$eventData.fbclid', null] }, null] }, 1, 0] } },
            converted:    { $max: { $cond: [{ $eq: ['$eventType', 'subscription_purchase'] }, 1, 0] } },
            signedUp:     { $max: { $cond: [{ $eq: ['$eventType', 'signup_complete'] }, 1, 0] } },
            loggedIn:     { $max: { $cond: [{ $eq: ['$eventType', 'login_success'] }, 1, 0] } }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userData',
            pipeline: [{ $project: { name: 1, email: 1, user_type: 1, profile_picture: 1 } }]
          }
        },
        {
          $project: {
            _id: 1, userId: 1, sessionId: 1, totalEvents: 1, eventTypes: 1,
            landingPage: 1, lastPage: 1, firstSeen: 1, lastSeen: 1,
            deviceType: 1, ip: 1, referrer: 1, utmSource: 1, utmCampaign: 1, utmMedium: 1,
            hasFbclid: 1, converted: 1, signedUp: 1, loggedIn: 1,
            user: { $arrayElemAt: ['$userData', 0] }
          }
        },
        { $sort: { lastSeen: -1 } },
        { $skip: skip },
        { $limit: limitInt }
      ])
    ]);

    // ─── Merge daily ad + organic into one array ─────────────────────────────
    const adMap = {};
    dailyAdStats.forEach(d => { adMap[d._id] = { ad: d.sessions, organic: 0 }; });
    dailyOrganicStats.forEach(d => {
      if (adMap[d._id]) adMap[d._id].organic = d.sessions;
      else adMap[d._id] = { ad: 0, organic: d.sessions };
    });
    const dailyAdVsOrganicStats = Object.entries(adMap).map(([date, v]) => ({
      _id: date, data: [{ type: 'ad', sessions: v.ad }, { type: 'organic', sessions: v.organic }]
    })).sort((a, b) => a._id.localeCompare(b._id));

    // ─── Reshape sourceStats to match frontend ────────────────────────────────
    const sourceStats = utmSourceStats.map(s => ({ _id: s._id, count: s.count }));

    // ─── userStats shape for frontend pie chart ───────────────────────────────
    const userStats = userTypeCounts;

    // ─── conversionFunnelSessions ─────────────────────────────────────────────
    const conversionFunnelSessions = {
      // New funnel: Visit → Signup → Login → Chat → Subscribe
      totalRegistered: totalUsers,   // all-time registered
      signedUp: signupCount,         // registered in period
      loggedIn: loginCount,          // unique users who logged in
      chatted: checkoutCount,        // unique users who sent a chat message
      subscribed: purchaseCount,     // all-time paid subscribers
      paidUserCount,
      freeUserCount,
      totalUsers,
      recentPaidUsers
    };

    res.status(200).json({
      success: true,
      data: {
        totalEventsExtracted,
        recentEvents,
        eventCounts,
        funnelStats: funnelByEvent,
        timeSeriesData,
        deviceStats,
        userStats,
        sourceStats,
        totalPages: Math.ceil(totalEventsExtracted / limitInt) || 1,
        currentPage: parseInt(page),
        userJourney,
        adTrafficBreakdown: adSourceStats,
        utmCampaignStats,
        landingPageStats,
        conversionFunnelSessions,
        topConvertedLandingPages: [],   // kept for API compatibility
        dailyAdVsOrganicStats
      }
    });

  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ error: 'Server error fetching analytics' });
  }
};
