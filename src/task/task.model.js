const Sequelize = require('sequelize');
const database = require('./../config/database');

const BucketModel = require('./../bucket/bucket.model');

const TaskModel = database.define('tasks', {
  name: Sequelize.STRING,
  descripton: Sequelize.STRING,
  type: Sequelize.STRING,
  path: Sequelize.STRING,
  bucket_path: Sequelize.STRING,
  schedule: Sequelize.STRING,
  generate_uuid: Sequelize.BOOLEAN
});

TaskModel.belongsTo(BucketModel, {foreignKey: 'bucket_id'});

TaskModel.sync()
  .catch((err) => {
    console.log('Erro ao sincronizar o model Task.', err)
  });

module.exports = TaskModel;