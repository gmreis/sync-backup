const Sequelize = require('sequelize');
const database = require('./../config/database');

const BucketModel = database.define('buckets', {
  name: Sequelize.STRING,
  path: Sequelize.STRING,
  region: Sequelize.STRING,
  accessKeyId: Sequelize.STRING,
  secretAccessKey: Sequelize.STRING  
});

BucketModel.sync()
  .catch((err) => {
    console.log('Erro ao sincronizar o model Bucket.', err)
  });

module.exports = BucketModel;