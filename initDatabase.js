const Sequelize = require('sequelize');
const database = require('./src/config/database');

const buckets = [ 
    { name: 'postomutum' },
];

const tasks = [ 
  {
    name: 'Autosystem',
    descripton: 'Backup de teste',
    type: 'FOLDER',
    path: '/home/geraldo/backup',
    bucket_id: 1,
    bucket_path: 'autosystemss3',
    schedule: '*/5 * * * * *',
    generate_uuid: true
  },
];

const showResults = (result) => {
    return result.map((res) => res.dataValues);
}

database
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
    process.exit(0);
  })
  .then(() => {
      const BucketModel = require('./src/bucket/bucket.model');
      let Promises = [];

      buckets.forEach((bucket) => {
        const promise = BucketModel.create(bucket);
        Promises.push(promise);
      })
      
      return Promise.all(Promises);
  })
  .then(() => console.log('Buckets criados com Sucesso!'))
  .then(() => {
    const TaskModel = require('./src/task/task.model');
    let Promises = [];

    tasks.forEach((task) => {
      const promise = TaskModel.create(task);
      Promises.push(promise);
    })
        
    return Promise.all(Promises);
  })
  .then(() => console.log('Tasks criados com Sucesso!'))
  //.then(() => BucketModel.findAll())
  //.then((result) => console.log('Resultados.:', showResults(result)))
  .catch(err => {
    console.error('Não inserido...:', err);
  })
  .then(() => {
    return database.close();
  });