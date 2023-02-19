const { Sequelize, Op } = require("sequelize");
const sequelize = require('../utils/database');
const Group = sequelize.define('groups',{
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      
      groupname: {
        type: Sequelize.STRING,
        allowNull: false
      }
    
})
    module.exports = Group;   