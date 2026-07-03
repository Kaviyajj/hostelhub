const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Warden = sequelize.define('Warden', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  assignedBlockId: {
    type: DataTypes.INTEGER,
    allowNull: true, // A warden may temporarily not be assigned a block
  }
});

module.exports = Warden;
