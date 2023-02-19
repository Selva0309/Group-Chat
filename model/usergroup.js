const Sequelize = require('sequelize');

const sequelize = require('../utils/database');

const Usergroup = sequelize.define('usergroup', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  }
  
});

module.exports = Usergroup;
