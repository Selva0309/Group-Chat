const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Uuid = sequelize.define('uuid', {
  id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true
  },
  
  isactive: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
});

module.exports = Uuid;