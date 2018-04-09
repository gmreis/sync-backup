const Moment = require('moment');
const program = require('commander');
const { logger } = require('./../src/config');

const SyncBackup = require('./../src/sync-backup');

program
  .version('0.1.0')
  .description('Gerenciador de Backup AWS S3');

program
  .command('file <pathFile>')
  .option('-d, --debugger')
  .description('Command to import all tasks')
  .action((pathFile, cmd) => {
    const start = new Moment();

    logger.info(`Sync ${cmd.name()}:`, pathFile);
    logger.info(`Start Sync ${cmd.name()}:`, start.format('YYYY-MM-DD HH:mm:ss'));

    SyncBackup.backupByFile(pathFile)
      .then(() => {
        const end = new Moment();
        logger.info(`End Sync ${cmd.name()}:`, end.format('YYYY-MM-DD HH:mm:ss'));

        const duration = Moment.utc(end.diff(start)).format('HH:mm:ss.SSS');
        logger.info('Total Time:', duration);
      });

  });

program
  .command('fileBySync')
  .description('Command to import all tasks')
  .action((cmd) => {
    logger.info(`Sync ${cmd.name()}...`);

    if (process.connected) {
      process.on('message', (file) => {
        const start = new Moment();
        logger.info(`Start Sync ${cmd.name()}:`, start.format('YYYY-MM-DD HH:mm:ss'));

        const S3 = require('./../src/aws/aws.s3');
        S3.sendFile(file.bucket, `${file.path}/${file.name}`)
          .then((answerAWS) => {
            process.send(answerAWS);
          })
          .catch((err) => {
            process.send(err);
          });
      });

    } else {
      logger.info('Esse comando é utilizado pelo sistema. Você não pode executar esse comando.');
    }

  });

// Assert that a VALID command is provided
if (!process.argv.slice(2).length || !/[arudl]/.test(process.argv.slice(2))) {
  program.outputHelp();
  process.exit();
}

program.parse(process.argv);
