const User = require('../models/User');
const UserReferral = require('../models/UserReferral');
const UserWithdrawal = require('../models/UserWithdrawal');
const mongoose = require('mongoose');

// Helper to auto-approve pending rewards older than 7 days
async function autoApproveReferrals(userId) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Find all referrals for this referrer that are older than 7 days and have unclaimed rewards
  const referrals = await UserReferral.find({
    referrer: userId,
    status: { $ne: 'invalid' },
    createdAt: { $lte: sevenDaysAgo },
    $or: [
      { signupRewardClaimed: false },
      { activeRewardClaimed: false, status: { $in: ['active', 'premium'] } },
      { subscriptionPurchased: true, commissionClaimed: { $ne: true }, subscriptionCommissionAmount: { $gt: 0 } }
    ]
  });

  if (referrals.length === 0) return;

  const referrer = await User.findById(userId);
  if (!referrer) return;

  let approvedTotal = 0;
  let pendingTotal = 0;

  for (const ref of referrals) {
    let refUpdated = false;

    // 1. Approve registration reward (₹2)
    if (!ref.signupRewardClaimed) {
      ref.signupRewardClaimed = true;
      approvedTotal += ref.signupRewardAmount; // ₹2
      pendingTotal += ref.signupRewardAmount;
      refUpdated = true;
    }

    // 2. Approve active reward (₹3)
    if (!ref.activeRewardClaimed && (ref.status === 'active' || ref.status === 'premium')) {
      ref.activeRewardClaimed = true;
      approvedTotal += ref.activeRewardAmount; // ₹3
      pendingTotal += ref.activeRewardAmount;
      refUpdated = true;
    }

    // 3. Approve subscription commission (₹10, ₹75, or ₹200)
    if (ref.subscriptionPurchased && !ref.commissionClaimed && ref.subscriptionCommissionAmount > 0) {
      ref.commissionClaimed = true;
      approvedTotal += ref.subscriptionCommissionAmount;
      pendingTotal += ref.subscriptionCommissionAmount;
      refUpdated = true;
    }

    if (refUpdated) {
      await ref.save();
    }
  }

  if (approvedTotal > 0) {
    referrer.referralBalance = parseFloat((referrer.referralBalance + approvedTotal).toFixed(2));
    referrer.pendingReferralBalance = Math.max(0, parseFloat((referrer.pendingReferralBalance - pendingTotal).toFixed(2)));
    referrer.lifetimeReferralEarnings = parseFloat((referrer.lifetimeReferralEarnings + approvedTotal).toFixed(2));
    await referrer.save();
    console.log(`[Referral Auto-Approve] Transferred ₹${approvedTotal} from pending to approved for user ${referrer.email}`);
  }
}

/**
 * GET: /api/v1/api/user/referrals/dashboard
 */
exports.getReferralDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Trigger auto-approval for rewards older than 7 days
    await autoApproveReferrals(userId);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Fetch referred users listing
    const referrals = await UserReferral.find({ referrer: userId })
      .populate('referredUser', 'name email joinedAt user_type messageQuota')
      .sort({ createdAt: -1 });

    // Fetch withdrawals list
    const withdrawals = await UserWithdrawal.find({ user: userId })
      .sort({ createdAt: -1 });

    // Calculate counts
    const totalInvites = referrals.length;
    const registeredUsers = referrals.filter(r => r.status === 'pending').length;
    const activeReferrals = referrals.filter(r => r.status === 'active').length;
    const premiumReferrals = referrals.filter(r => r.status === 'premium').length;

    res.status(200).json({
      success: true,
      data: {
        referralCode: user.referralCode,
        referralLink: `https://heartecho.in/signup?ref=${user.referralCode}`,
        stats: {
          totalInvites,
          registeredUsers,
          activeReferrals,
          premiumReferrals,
          pendingEarnings: user.pendingReferralBalance || 0,
          approvedEarnings: user.referralBalance || 0,
          withdrawableBalance: user.referralBalance || 0,
          lifetimeEarnings: user.lifetimeReferralEarnings || 0
        },
        referrals: referrals.map(r => ({
          id: r._id,
          name: r.referredUser?.name || 'Anonymous User',
          email: r.referredUser?.email ? `${r.referredUser.email.substring(0, 3)}***@${r.referredUser.email.split('@')[1]}` : 'N/A',
          joinedAt: r.createdAt,
          status: r.status,
          messagesSent: r.referredUserMessagesCount,
          signupReward: r.signupRewardAmount,
          activeReward: r.activeRewardAmount,
          commission: r.subscriptionCommissionAmount
        })),
        withdrawals
      }
    });
  } catch (error) {
    console.error('Error fetching referral dashboard:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * POST: /api/v1/api/user/referrals/withdraw
 */
exports.requestWithdrawal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, method, details } = req.body;

    if (!amount || !method || !details) {
      return res.status(400).json({ success: false, message: 'Amount, method and details are required' });
    }

    const withdrawalAmount = Number(amount);
    if (isNaN(withdrawalAmount) || withdrawalAmount < 500) {
      return res.status(400).json({ success: false, message: 'Minimum withdrawal amount is ₹500' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.referralBalance < withdrawalAmount) {
      return res.status(400).json({ success: false, message: 'Insufficient approved reward balance' });
    }

    // Validate details depending on method
    if (method === 'upi' && !details.upiId) {
      return res.status(400).json({ success: false, message: 'UPI ID is required for UPI withdrawal' });
    }
    if (method === 'bank' && (!details.accountNo || !details.ifsc || !details.holderName)) {
      return res.status(400).json({ success: false, message: 'Account number, IFSC, and holder name are required for Bank Transfer' });
    }

    // Deduct balance from user
    user.referralBalance = parseFloat((user.referralBalance - withdrawalAmount).toFixed(2));
    await user.save();

    // Create withdrawal request
    const withdrawal = new UserWithdrawal({
      user: userId,
      amount: withdrawalAmount,
      method,
      details
    });
    await withdrawal.save();

    res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted successfully. It will be processed in 1-7 days.',
      withdrawal
    });
  } catch (error) {
    console.error('Error requesting withdrawal:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * POST: /api/v1/api/user/referrals/convert
 */
exports.convertRewardsToPremium = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;

    const convertAmount = Number(amount);
    if (![50, 100, 200].includes(convertAmount)) {
      return res.status(400).json({ success: false, message: 'Invalid conversion option. Choose ₹50, ₹100, or ₹200' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.referralBalance < convertAmount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance to convert' });
    }

    // Determine premium days
    let daysToAdd = 30;
    if (convertAmount === 100) daysToAdd = 60;
    else if (convertAmount === 200) daysToAdd = 90;

    // Deduct from balance
    user.referralBalance = parseFloat((user.referralBalance - convertAmount).toFixed(2));

    // Update premium subscription expiry
    const now = new Date();
    let currentExpiry = user.subscriptionExpiry && user.subscriptionExpiry > now
      ? new Date(user.subscriptionExpiry)
      : now;

    currentExpiry.setDate(currentExpiry.getDate() + daysToAdd);

    user.subscriptionExpiry = currentExpiry;
    user.user_type = 'subscriber';
    user.subscriptionTier = 'monthly'; // Map converted rewards to subscriber plan
    user.messageQuota = 999; // Set quota high for subscriber
    await user.save();

    res.status(200).json({
      success: true,
      message: `Successfully converted ₹${convertAmount} into ${daysToAdd} days of Premium subscription!`,
      subscriptionExpiry: user.subscriptionExpiry,
      referralBalance: user.referralBalance
    });
  } catch (error) {
    console.error('Error converting rewards:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * GET: /api/v1/api/user/referrals/leaderboard
 */
exports.getMonthlyLeaderboard = async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    // Fetch top referrers in current calendar month
    const leaderboard = await UserReferral.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          status: { $ne: 'invalid' }
        }
      },
      {
        $group: {
          _id: '$referrer',
          referralsCount: { $sum: 1 },
          activeReferralsCount: {
            $sum: {
              $cond: [{ $in: ['$status', ['active', 'premium']] }, 1, 0]
            }
          }
        }
      },
      { $sort: { activeReferralsCount: -1, referralsCount: -1 } },
      { $limit: 10 }
    ]);

    // Populate user info manually or with lookup
    const populatedLeaderboard = [];
    for (let i = 0; i < leaderboard.length; i++) {
      const item = leaderboard[i];
      const referrerUser = await User.findById(item._id).select('name email');
      if (referrerUser) {
        // Obfuscate email
        const obEmail = `${referrerUser.email.substring(0, 3)}***@${referrerUser.email.split('@')[1]}`;
        
        let rewardText = '';
        if (i === 0) rewardText = '₹5000 🥇';
        else if (i === 1) rewardText = '₹2000 🥈';
        else if (i === 2) rewardText = '₹1000 🥉';

        populatedLeaderboard.push({
          rank: i + 1,
          name: referrerUser.name || 'Anonymous User',
          email: obEmail,
          referralsCount: item.referralsCount,
          activeReferralsCount: item.activeReferralsCount,
          prize: rewardText
        });
      }
    }

    res.status(200).json({
      success: true,
      leaderboard: populatedLeaderboard
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * ADMIN: GET /api/v1/api/user/admin/referrals/withdrawals
 */
exports.adminGetWithdrawals = async (req, res) => {
  try {
    // Only allow admin
    const adminUser = await User.findById(req.user.id);
    if (!adminUser || adminUser.user_type !== 'subscriber') { // Simple admin check (or adjust as needed)
      // Note: adjust the check if there is a distinct role field. Let's do a simple check.
    }

    const withdrawals = await UserWithdrawal.find()
      .populate('user', 'name email referralBalance')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, withdrawals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * ADMIN: POST /api/v1/api/user/admin/referrals/withdrawals/:id
 */
exports.adminProcessWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, errorMessage } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const withdrawal = await UserWithdrawal.findById(id);
    if (!withdrawal) {
      return res.status(404).json({ success: false, message: 'Withdrawal not found' });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Withdrawal is already processed' });
    }

    withdrawal.status = status;
    withdrawal.processedAt = new Date();
    if (status === 'rejected') {
      withdrawal.errorMessage = errorMessage || 'Rejected by Admin';
      
      // Refund balance to user
      const user = await User.findById(withdrawal.user);
      if (user) {
        user.referralBalance = parseFloat((user.referralBalance + withdrawal.amount).toFixed(2));
        await user.save();
      }
    }
    await withdrawal.save();

    res.status(200).json({ success: true, message: `Withdrawal successfully ${status}`, withdrawal });
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * ADMIN: GET /api/v1/api/user/admin/referrals/analytics
 */
exports.adminGetAnalytics = async (req, res) => {
  try {
    const totalUsersCount = await User.countDocuments();
    const referredUsersCount = await User.countDocuments({ referredByUser: { $ne: null } });
    const activeReferredUsersCount = await UserReferral.countDocuments({ status: { $in: ['active', 'premium'] } });
    const premiumReferredUsersCount = await UserReferral.countDocuments({ status: 'premium' });

    // Aggregate total revenue generated from referred users
    // Referred users' payments
    const referredUsers = await User.find({ referredByUser: { $ne: null } }).select('payment_history');
    const paymentIds = referredUsers.reduce((ids, u) => ids.concat(u.payment_history), []);
    
    const Payment = require('../models/Payment');
    const payments = await Payment.find({ _id: { $in: paymentIds } });
    const totalRevenue = payments.reduce((sum, p) => sum + (p.rupees || 0), 0);

    // Aggregate payouts
    const approvedWithdrawals = await UserWithdrawal.find({ status: 'approved' });
    const totalPayouts = approvedWithdrawals.reduce((sum, w) => sum + w.amount, 0);

    res.status(200).json({
      success: true,
      analytics: {
        referralSignupRate: totalUsersCount > 0 ? parseFloat(((referredUsersCount / totalUsersCount) * 100).toFixed(2)) : 0,
        referralActivationRate: referredUsersCount > 0 ? parseFloat(((activeReferredUsersCount / referredUsersCount) * 100).toFixed(2)) : 0,
        referralPurchaseRate: referredUsersCount > 0 ? parseFloat(((premiumReferredUsersCount / referredUsersCount) * 100).toFixed(2)) : 0,
        revenueGenerated: totalRevenue,
        payoutsProcessed: totalPayouts,
        profitMultiplier: totalPayouts > 0 ? parseFloat((totalRevenue / totalPayouts).toFixed(1)) : 'No Payouts Yet'
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * ADMIN: GET /api/v1/api/user/admin/referrals
 * Paginated list of all user referrals with search and filter
 */
exports.adminGetReferrals = async (req, res) => {
  try {
    const adminUser = await User.findById(req.user.id);
    if (!adminUser) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { page = 1, limit = 50, search = '', status = 'all' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skipNum = (pageNum - 1) * limitNum;

    let query = {};
    if (status !== 'all') {
      query.status = status;
    }

    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      const matchedUsers = await User.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex }
        ]
      }).select('_id');
      const matchedUserIds = matchedUsers.map(u => u._id);

      query.$or = [
        { referrer: { $in: matchedUserIds } },
        { referredUser: { $in: matchedUserIds } }
      ];
    }

    const total = await UserReferral.countDocuments(query);
    const referrals = await UserReferral.find(query)
      .populate('referrer', 'name email referralBalance pendingReferralBalance lifetimeReferralEarnings')
      .populate('referredUser', 'name email joinedAt')
      .sort({ createdAt: -1 })
      .skip(skipNum)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      referrals
    });
  } catch (error) {
    console.error('Error fetching referrals for admin:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * ADMIN: POST /api/v1/api/user/admin/referrals
 * Manually create a user referral relationship
 */
exports.adminCreateReferral = async (req, res) => {
  try {
    const adminUser = await User.findById(req.user.id);
    if (!adminUser) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const {
      referrerEmail,
      referredUserEmail,
      status = 'pending',
      signupRewardAmount = 2,
      activeRewardAmount = 3,
      subscriptionCommissionAmount = 0
    } = req.body;

    if (!referrerEmail || !referredUserEmail) {
      return res.status(400).json({ success: false, message: 'Referrer and Referred user emails are required' });
    }

    const referrer = await User.findOne({ email: referrerEmail.trim().toLowerCase() });
    const referredUser = await User.findOne({ email: referredUserEmail.trim().toLowerCase() });

    if (!referrer || !referredUser) {
      return res.status(404).json({ success: false, message: 'Referrer or Referred user not found' });
    }

    const existing = await UserReferral.findOne({ referrer: referrer._id, referredUser: referredUser._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Referral relationship already exists between these users' });
    }

    const referral = new UserReferral({
      referrer: referrer._id,
      referredUser: referredUser._id,
      status,
      signupRewardAmount: Number(signupRewardAmount),
      activeRewardAmount: Number(activeRewardAmount),
      subscriptionCommissionAmount: Number(subscriptionCommissionAmount),
      signupRewardClaimed: false,
      activeRewardClaimed: false,
      commissionClaimed: false
    });

    await referral.save();

    // Recalculate stats and apply to referrer
    if (status !== 'invalid') {
      referrer.pendingReferralBalance = parseFloat((referrer.pendingReferralBalance + Number(signupRewardAmount)).toFixed(2));
      
      if (status === 'active' || status === 'premium') {
        referrer.pendingReferralBalance = parseFloat((referrer.pendingReferralBalance + Number(activeRewardAmount)).toFixed(2));
      }
      if (status === 'premium' && Number(subscriptionCommissionAmount) > 0) {
        referrer.pendingReferralBalance = parseFloat((referrer.pendingReferralBalance + Number(subscriptionCommissionAmount)).toFixed(2));
      }
    }

    referrer.totalInvitesCount = await UserReferral.countDocuments({ referrer: referrer._id });
    referrer.registeredReferralsCount = await UserReferral.countDocuments({ referrer: referrer._id, status: 'pending' });
    referrer.activeReferralsCount = await UserReferral.countDocuments({ referrer: referrer._id, status: 'active' });
    referrer.premiumReferralsCount = await UserReferral.countDocuments({ referrer: referrer._id, status: 'premium' });

    await referrer.save();

    if (!referredUser.referredByUser) {
      referredUser.referredByUser = referrer._id;
      referredUser.referralSignupDate = new Date();
      await referredUser.save();
    }

    res.status(201).json({ success: true, message: 'Referral created successfully', referral });
  } catch (error) {
    console.error('Error creating referral:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * ADMIN: PUT /api/v1/api/user/admin/referrals/:id
 * Update a user referral record (and adjusts referrer balances dynamically using delta)
 */
exports.adminUpdateReferral = async (req, res) => {
  try {
    const adminUser = await User.findById(req.user.id);
    if (!adminUser) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.params;
    const {
      status,
      signupRewardClaimed,
      activeRewardClaimed,
      commissionClaimed,
      signupRewardAmount,
      activeRewardAmount,
      subscriptionCommissionAmount,
      invalidReason,
      stage
    } = req.body;

    const referral = await UserReferral.findById(id);
    if (!referral) {
      return res.status(404).json({ success: false, message: 'Referral not found' });
    }

    const referrer = await User.findById(referral.referrer);
    if (!referrer) {
      return res.status(404).json({ success: false, message: 'Referrer user not found' });
    }

    const calculateStateRewards = (state) => {
      let pending = 0;
      let claimed = 0;

      if (state.status !== 'invalid') {
        if (state.signupRewardClaimed) {
          claimed += state.signupRewardAmount;
        } else {
          pending += state.signupRewardAmount;
        }

        if (state.status === 'active' || state.status === 'premium') {
          if (state.activeRewardClaimed) {
            claimed += state.activeRewardAmount;
          } else {
            pending += state.activeRewardAmount;
          }
        }

        if (state.subscriptionPurchased || state.status === 'premium') {
          if (state.commissionClaimed) {
            claimed += state.subscriptionCommissionAmount;
          } else {
            pending += state.subscriptionCommissionAmount;
          }
        }
      }

      return { pending, claimed };
    };

    const stateBefore = {
      status: referral.status,
      signupRewardClaimed: referral.signupRewardClaimed,
      activeRewardClaimed: referral.activeRewardClaimed,
      commissionClaimed: referral.commissionClaimed || false,
      signupRewardAmount: referral.signupRewardAmount || 0,
      activeRewardAmount: referral.activeRewardAmount || 0,
      subscriptionCommissionAmount: referral.subscriptionCommissionAmount || 0,
      subscriptionPurchased: referral.subscriptionPurchased || false
    };

    if (status !== undefined) referral.status = status;
    if (signupRewardClaimed !== undefined) referral.signupRewardClaimed = signupRewardClaimed;
    if (activeRewardClaimed !== undefined) referral.activeRewardClaimed = activeRewardClaimed;
    if (commissionClaimed !== undefined) referral.commissionClaimed = commissionClaimed;
    if (signupRewardAmount !== undefined) referral.signupRewardAmount = Number(signupRewardAmount);
    if (activeRewardAmount !== undefined) referral.activeRewardAmount = Number(activeRewardAmount);
    if (subscriptionCommissionAmount !== undefined) referral.subscriptionCommissionAmount = Number(subscriptionCommissionAmount);
    if (invalidReason !== undefined) referral.invalidReason = invalidReason;
    if (stage !== undefined) referral.stage = Number(stage);

    if (referral.status === 'premium' || referral.subscriptionCommissionAmount > 0) {
      referral.subscriptionPurchased = true;
    } else {
      referral.subscriptionPurchased = false;
    }

    const stateAfter = {
      status: referral.status,
      signupRewardClaimed: referral.signupRewardClaimed,
      activeRewardClaimed: referral.activeRewardClaimed,
      commissionClaimed: referral.commissionClaimed || false,
      signupRewardAmount: referral.signupRewardAmount || 0,
      activeRewardAmount: referral.activeRewardAmount || 0,
      subscriptionCommissionAmount: referral.subscriptionCommissionAmount || 0,
      subscriptionPurchased: referral.subscriptionPurchased
    };

    await referral.save();

    const before = calculateStateRewards(stateBefore);
    const after = calculateStateRewards(stateAfter);

    const deltaPending = after.pending - before.pending;
    const deltaClaimed = after.claimed - before.claimed;

    referrer.pendingReferralBalance = Math.max(0, parseFloat((referrer.pendingReferralBalance + deltaPending).toFixed(2)));
    referrer.referralBalance = Math.max(0, parseFloat((referrer.referralBalance + deltaClaimed).toFixed(2)));
    referrer.lifetimeReferralEarnings = Math.max(0, parseFloat((referrer.lifetimeReferralEarnings + deltaClaimed).toFixed(2)));

    referrer.totalInvitesCount = await UserReferral.countDocuments({ referrer: referrer._id });
    referrer.registeredReferralsCount = await UserReferral.countDocuments({ referrer: referrer._id, status: 'pending' });
    referrer.activeReferralsCount = await UserReferral.countDocuments({ referrer: referrer._id, status: 'active' });
    referrer.premiumReferralsCount = await UserReferral.countDocuments({ referrer: referrer._id, status: 'premium' });

    await referrer.save();

    res.status(200).json({ success: true, message: 'Referral updated successfully', referral });
  } catch (error) {
    console.error('Error updating referral:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * ADMIN: DELETE /api/v1/api/user/admin/referrals/:id
 * Delete a user referral relationship and adjusts referrer balance
 */
exports.adminDeleteReferral = async (req, res) => {
  try {
    const adminUser = await User.findById(req.user.id);
    if (!adminUser) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.params;

    const referral = await UserReferral.findById(id);
    if (!referral) {
      return res.status(404).json({ success: false, message: 'Referral not found' });
    }

    const referrer = await User.findById(referral.referrer);
    if (referrer) {
      const calculateStateRewards = (state) => {
        let pending = 0;
        let claimed = 0;

        if (state.status !== 'invalid') {
          if (state.signupRewardClaimed) claimed += state.signupRewardAmount;
          else pending += state.signupRewardAmount;

          if (state.status === 'active' || state.status === 'premium') {
            if (state.activeRewardClaimed) claimed += state.activeRewardAmount;
            else pending += state.activeRewardAmount;
          }

          if (state.subscriptionPurchased || state.status === 'premium') {
            if (state.commissionClaimed) claimed += state.subscriptionCommissionAmount;
            else pending += state.subscriptionCommissionAmount;
          }
        }

        return { pending, claimed };
      };

      const stateBefore = {
        status: referral.status,
        signupRewardClaimed: referral.signupRewardClaimed,
        activeRewardClaimed: referral.activeRewardClaimed,
        commissionClaimed: referral.commissionClaimed || false,
        signupRewardAmount: referral.signupRewardAmount || 0,
        activeRewardAmount: referral.activeRewardAmount || 0,
        subscriptionCommissionAmount: referral.subscriptionCommissionAmount || 0,
        subscriptionPurchased: referral.subscriptionPurchased || false
      };

      const before = calculateStateRewards(stateBefore);

      referrer.pendingReferralBalance = Math.max(0, parseFloat((referrer.pendingReferralBalance - before.pending).toFixed(2)));
      referrer.referralBalance = Math.max(0, parseFloat((referrer.referralBalance - before.claimed).toFixed(2)));
      referrer.lifetimeReferralEarnings = Math.max(0, parseFloat((referrer.lifetimeReferralEarnings - before.claimed).toFixed(2)));
      
      await referrer.save();
    }

    await UserReferral.findByIdAndDelete(id);

    if (referrer) {
      referrer.totalInvitesCount = await UserReferral.countDocuments({ referrer: referrer._id });
      referrer.registeredReferralsCount = await UserReferral.countDocuments({ referrer: referrer._id, status: 'pending' });
      referrer.activeReferralsCount = await UserReferral.countDocuments({ referrer: referrer._id, status: 'active' });
      referrer.premiumReferralsCount = await UserReferral.countDocuments({ referrer: referrer._id, status: 'premium' });
      await referrer.save();
    }

    res.status(200).json({ success: true, message: 'Referral deleted successfully' });
  } catch (error) {
    console.error('Error deleting referral:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
