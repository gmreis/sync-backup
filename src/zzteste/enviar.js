

process.on('message', (msg) => {
    console.log('Message from parent:', msg);

    setTimeout(() => {
        process.send({
            Location: 'https://postomutum.s3.amazonaws.com/df2d01c2e63680b1772dbaac832537ac',
            Bucket: 'postomutum',
            Key: 'df2d01c2e63680b1772dbaac832537ac',
            ETag: '"9cbfca02c1f63e671a09df951bb224fe-6"'
          });
    }, 1000);
});

console.log('Processando...', process.argv[2]);