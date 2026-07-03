const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('present', 'absent', 'leave'),
    allowNull: false,
    defaultValue: 'present',
  },
  markedByWardenId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Can be marked by Admin or Warden
  }
}, {
  // Prevent duplicate attendance for a student on the same day
  indexes: [
    {
      unique: true,
      fields: ['date', 'studentId']
    }
  ]
});

module.exports = Attendance;
