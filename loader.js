/*
AWS.config.update({
    region: bucketRegion,
    credentials: new AWS.CognitoIdentityCredentials({
      IdentityPoolId: IdentityPoolId
    })
  });

  var s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    params: {Bucket: albumBucketName}
  });
*/

const Sequelize = require('sequelize');
const database = require('./src/config/database');

const Project = database.define('project', {
  title: Sequelize.STRING,
  description: Sequelize.TEXT
})

database
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  })
  .then(() => Project.sync())
  .then(() => Project.create({
    title: 'Titulo',
    description: 'Descricao'
  }))
  .then(() => Project.findAll())
  .then((result) => console.log('Resiltados.:', result[0].dataValues))
  .catch(err => {
    console.error('Não inserido...:', err);
  })
  .then(() => {
    return database.close();
  });
