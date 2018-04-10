const fs =  require('fs');
const AWS = require('aws-sdk');
const md5File = require('md5-file')

//TODO: Verificar se o credential.json existes
AWS.config.loadFromPath('./cred.json');

// Create S3 service object
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

const createBucket = (bucketName) => {
  return new Promise((resolve, reject) => {
    // Call S3 to create the bucket
    s3.createBucket({Bucket: bucketName}, function(err, data) {
      if (err) {
        console.log("Error createBucket", err.message);
        reject(err);
      } else {
        console.log("Success createBucket:", data);
        resolve(data);
      }
    });
  });
}


const listBuckets = () => {
  // Call S3 to list current buckets
  return new Promise((resolve, reject) => {
    s3.listBuckets((err, data) => {
      if (err) {
        console.log("Error", err.message);
        reject(err);
      } else {
        console.log("listBuckets", data.Buckets);
        resolve(data.Buckets);
      }
    });
  });
};

const findBucket = (bucketName) => {
  return listBuckets()
          .then((buckets) => {
            console.log('buckets:', buckets);
            return buckets.find((bucket) => bucket.Name === bucketName);
          });
};

const findOrCreateBucket = (bucketName) => {
  return listBuckets()
          .then((buckets) => buckets.find((bucket) => bucket.Name === bucketName))
          .then((bucket) => {
            console.log('Bucket Name:', bucket);
            if(!bucket)
              return createBucket(bucketName);

            return bucket;
          });
};

const sendFile = (bucketName, filePath) => {
  if(fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
    const buffer = fs.createReadStream(filePath);

    return findOrCreateBucket(bucketName)
          .then((bucket) => uploadFile(bucket.Name, buffer))
          .catch((err) => {
            console.log('Erro', err);
          });
  } else {
    return new Promise((resolve, reject) => { return reject(`File don't exist or it's directory!`) });
  }
}

const uploadFile = (bucketName, fileStream) => {
   // call S3 to retrieve upload file to specified bucket
  const uploadParams = {Bucket: bucketName, Key: '', Body: ''};

  uploadParams.Body = fileStream;
  uploadParams.Key = md5File.sync(fileStream.path);

  return new Promise((resolve, reject) => {
    // call S3 to retrieve upload file to specified bucket
    s3.upload (uploadParams, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });

}

/*
  https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#createMultipartUpload-property


  https://gist.github.com/kkc/8b12ef8d4a0d2842d83e
  createMultipartUpload
*/
module.exports = { createBucket, findBucket, findOrCreateBucket, listBuckets, uploadFile, sendFile };
