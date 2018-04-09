var fs =  require('fs');

const database = require('./../config/database');
const FileService = require('./../file/file.service');

const S3 = require('./../aws.s3');

const filesToSend = [];

const init = () => {
  return database.authenticate();
//          .then(() => AWS.init());
}

const sendFile = (_file) => {

    return init()
        .then(() => {
            return {
                Location: 'https://postomutum.s3.amazonaws.com/df2d01c2e63680b1772dbaac832537ac',
                Bucket: 'postomutum',
                Key: 'df2d01c2e63680b1772dbaac832537ac',
                ETag: '"9cbfca02c1f63e671a09df951bb224fe-6"'
              }
        })

    /*
    const filePath = `${_file.path}/${_file.name}`;
    return init()
      .then(() => fs.existsSync(filePath))
      .then(() => fs.createReadStream(filePath))
      .then((buffer) => {
        console.log('Pegar o Bucket daqui:', _file)
        return S3.findOrCreateBucket('postomutum')
          .then((bucket) => S3.uploadFile(bucket.Name, buffer))
          .catch((err) => {
            console.log('Erro', err);
          });
      });
      */
}

const { fork } = require('child_process');

const sync = () => {
    if(filesToSend.length) {
        const fileObj = filesToSend.shift();
        console.log('Enviando...', fileObj.file.name);
        //const syncFile = fork('./src/zzteste/enviar.js', [fileObj]);
        const syncFile = fork('./bin/sync.backup.js', ['fileBySync']);

        syncFile.on('message', (answerAWS) => {
            console.log('OK, funcionou...', fileObj);
            //FileService.fileSent(fileObj.file, answerAWS)
            sync();
        });
        syncFile.send(fileObj);
    }
}
/*
const sync = () => {
    const fileObj = filesToSend.shift();
    console.log('Enviando...', fileObj.file.name);
    sendFile(fileObj.file)
        .then((answerAWS) => {
            console.log('OK, funcionou...', fileObj);
            return FileService.fileSent(fileObj.file, answerAWS)
        })
        .catch((err) => {
            console.error('File not sent', fileObj.file);
            console.error('Message', err);

            if (fileObj.attempts++ < 3) {
                console.error('Vamos tentar a ', fileObj.attempts+1, ' vez!');
                filesToSend.push(fileObj);
            }
        })
        .then(() => filesToSend.length ? sync() : false);
}
*/

const execTask = (task) => {
    switch(task.type) {
        case 'FOLDER':
            const files = fs.readdirSync(task.path);
            console.log('Files', files);
            FileService.checkFiles(task, files)
              .then((filesWithoutSync) => {
                const start = filesToSend.length === 0;
                filesWithoutSync.forEach((file) => {
                  // TODO: Verificar se o arquivo já está na fila de envio...
                  filesToSend.push({file, attempts: 0});
                });
                if (start) sync();
              });
            break;
        case 'SCRIPT':
            break;
        default:
            console.log('Tipo não definido!');
    }
};

module.exports = { execTask };
