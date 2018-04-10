const Moment = require('moment');
const program = require('commander');
const { logger } = require('./../src/config');

const S3 = require('./../src/aws/aws.s3');

program
  .version('0.1.0')
  .description('Gerenciador de Backup AWS S3');

program
  .command('file <pathFile>')
  .option('-d, --debugger')
  .description('Command to send file to S3 AWS')
  .action((pathFile, cmd) => {
    const start = new Moment();

    logger.info(`Sync ${cmd.name()}:`, pathFile);
    logger.info(`Start Sync ${cmd.name()}:`, start.format('YYYY-MM-DD HH:mm:ss'));

    S3.sendFile('postomutum', pathFile)
      .then((answerAWS) => {
        const end = new Moment();

        logger.info(`Answer AWS: ${answerAWS}`);

        logger.info(`End Sync ${cmd.name()}:`, end.format('YYYY-MM-DD HH:mm:ss'));
        const duration = Moment.utc(end.diff(start)).format('HH:mm:ss.SSS');
        logger.info('Total Time:', duration);
      })
      .catch((err) => {
        logger.error(err);
      });

  });

program
  .command('fileBySync')
  .description('Command to send file to S3 AWS')
  .action((cmd) => {
    logger.info(`Sync ${cmd.name()}...`);

    if (process.connected) {
      process.on('message', (file) => {
        const start = new Moment();
        logger.info(`Start Sync ${cmd.name()}:`, start.format('YYYY-MM-DD HH:mm:ss'));

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
