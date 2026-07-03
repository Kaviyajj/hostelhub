const { ActivityLog } = require('../models');

const logActivity = async (userId, action, details) => {
  try {
    await ActivityLog.create({
      userId,
      action,
      details: typeof details === 'object' ? JSON.stringify(details) : details
    });
  } catch (error) {
    console.error('Failed to log activity in database:', error);
  }
};

module.exports = { logActivity };
