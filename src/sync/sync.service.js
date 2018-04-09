var fs =  require('fs');

const FileService = require('./../file/file.service');

const filesToSend = [];

const { fork } = require('child_process');

const sync = () => {
    if(filesToSend.length) {
        const fileObj = filesToSend.shift();
        console.log('Enviando...', fileObj.file.name);
        const syncFile = fork('./bin/sync.backup.js', ['fileBySync']);

        syncFile.on('message', (answerAWS) => {
            console.log('Arquivo enviado com sucesso:', answerAWS);

            // TODO: E se der erro no envio do arquivo???

            sync();
        });
        syncFile.send(fileObj.file);
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
