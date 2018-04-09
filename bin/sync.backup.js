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
      process.on('message', (objFile) => {
        console.log('Message from parent:', objFile);

        const start = new Moment();
        logger.info(`Start Sync ${cmd.name()}:`, start.format('YYYY-MM-DD HH:mm:ss'));

        setTimeout(() => {
            process.send({
                Location: 'https://postomutum.s3.amazonaws.com/df2d01c2e63680b1772dbaac832537ac',
                Bucket: 'postomutum',
                Key: 'df2d01c2e63680b1772dbaac832537ac',
                ETag: '"9cbfca02c1f63e671a09df951bb224fe-6"'
              });
        }, 2000);
      });
    } else {
      logger.info('Esse comando é utilizado pelo sistema. Você não pode executar esse comando.');
    }
/*
    SyncBackup.backupByFile(pathFile)
      .then(() => {
        const end = new Moment();
        logger.info(`End Sync ${cmd.name()}:`, end.format('YYYY-MM-DD HH:mm:ss'));

        const duration = Moment.utc(end.diff(start)).format('HH:mm:ss.SSS');
        logger.info('Total Time:', duration);
      });
*/
  });

// Assert that a VALID command is provided
if (!process.argv.slice(2).length || !/[arudl]/.test(process.argv.slice(2))) {
  program.outputHelp();
  process.exit();
}

program.parse(process.argv);
