const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RoomAllocation = sequelize.define('RoomAllocation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  roomId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  allocationDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  vacateDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'vacated'),
    defaultValue: 'active',
    allowNull: false,
  }
});

module.exports = RoomAllocation;
