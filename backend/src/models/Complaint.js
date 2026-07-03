const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Complaint = sequelize.define('Complaint', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('electrical', 'water', 'internet', 'furniture', 'cleaning', 'security', 'others'),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'assigned', 'in_progress', 'resolved'),
    defaultValue: 'pending',
    allowNull: false,
  },
  assignedStaff: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resolutionNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
});

module.exports = Complaint;
