const Sequelize = require('sequelize');
const database = require('./../config/database');

const FileModel = database.define('files', {
  name: Sequelize.STRING,
  hash: Sequelize.TEXT
});

module.exports = FileModel;
