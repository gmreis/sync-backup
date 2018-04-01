const Sequelize = require('sequelize');
const database = require('./../config/database');

const BucketModel = require('./../bucket/bucket.model');
const TaskModel = require('./../task/task.model');

const FileModel = database.define('files', {
  name: Sequelize.STRING,
  path: Sequelize.STRING,
  md5: Sequelize.STRING,
  aws_key: Sequelize.STRING,
  aws_location: Sequelize.STRING
});

FileModel.belongsTo(BucketModel, {foreignKey: 'bucket_id'});
FileModel.belongsTo(TaskModel, {foreignKey: 'task_id'});

FileModel.sync()
  .catch((err) => {
    console.log('Erro ao sincronizar o model File.', err)
  });

module.exports = FileModel;
