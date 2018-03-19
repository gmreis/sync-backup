var fs =  require('fs');

const database = require('./../config/database');
const FileModel = require('./../file/file.model');

//const AWS = require('./../aws/aws');
const S3 = require('./../aws.s3/aws.s3');

const init = () => {
  return database.authenticate()
          .then(() => FileModel.sync());
//          .then(() => AWS.init());
}

const backupByScript = () => {

};

const backupByFile = (pathFile) => {
  return init()
    .then(() => fs.createReadStream(pathFile))
    /*
    TODO: Verificar se o arquivo existe...

    .then((buffer) => {
      buffer.on('error', function(err) {
        console.log('File Error', err);
      });
    })
    */
    .then((buffer) => {
      return S3.findOrCreateBucket('postomutum')
        .then((bucket) => S3.uploadFile(bucket.Name, buffer))
        .catch((err) => {
          console.log('Erro', err);
        });
    });

}

module.exports = { backupByFile };
