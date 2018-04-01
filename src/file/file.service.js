const Op = require('sequelize').Op;
const FileModel = require('./file.model');

const add = (_file) => {
    return FileModel.create(_file).then((file) => file.dataValues);
}

const saveAll = (task, files) => {
    let promises = [];

    files.forEach(file => {
        const promise = add({
            name: file,
            path: task.path,
            task_id: task.id,
            bucket_id: task.bucket_id
        });
        promises.push(promise);
    });

    return Promise.all(promises);
}

const findByTaskId = (task_id) => {
    const conditions = { where: { task_id } };
    return FileModel.findAll( conditions )
        .then((files) => files.map((file) => file.dataValues));
};

const findAll = (conditions) => {
    return FileModel.findAll(conditions || {})
        .then((files) => files.map((file) => file.dataValues));
};

const checkFiles = (task, newFiles) => {
    const conditions = {
        where: { 
            task_id: task.id,
            [Op.or]: newFiles.map((newFile) => { return {name: newFile} })
        }
    }
    
    return findAll(conditions)
        .then((files) => {
            if(files.length) {
                const fileWithoutSave = [];

                newFiles.map((newFile) => {
                    if (files.every((oldFile) => oldFile.name !== newFile)) {
                        fileWithoutSave.push(newFile);
                    }
                });

                return saveAll(task, fileWithoutSave);
            } else {
                return saveAll(task, newFiles);
            }
        });
}

/*
{ ETag: '"f158bd837c6ed3383b294fd688099487"',
  Location: 'https://postomutum.s3.amazonaws.com/f158bd837c6ed3383b294fd688099487',
  key: 'f158bd837c6ed3383b294fd688099487',
  Key: 'f158bd837c6ed3383b294fd688099487',
  Bucket: 'postomutum' }
*/
const fileSent = (_file, answerAWS) => {
    console.log('Antes do FindById', _file);
    return FileModel.findById(_file.id)
        .then((file) => {
            console.log('Resultado do FindById', file);
            console.log('Antes do FindById, ETag', answerAWS.ETag);
            console.log('Antes do FindById, key', answerAWS.key);
            console.log('Antes do FindById, Key', answerAWS.Key);
            return file.update({
                aws_key: answerAWS.Key,
                aws_location: answerAWS.Location,
            });

        });
}

module.exports = { checkFiles, fileSent }