const fs =  require('fs');
const AWS = require('aws-sdk');
const md5File = require('md5-file')

AWS.config.loadFromPath('./cred.json');

const s3 = new AWS.S3({apiVersion: '2006-03-01'});

const createBucket = (bucketName) => {
  return new Promise((resolve, reject) => {
    s3.createBucket({Bucket: bucketName},
      (err, data) => err ? reject(err) : resolve({ Name: data.Location.substr(1) }));
  });
}

const listBuckets = () => {
  return new Promise((resolve, reject) => {
    s3.listBuckets((err, data) => err ? reject(err) : resolve(data.Buckets));
  });
};

const findBucket = (bucketName) => {
  return listBuckets()
          .then((buckets) => buckets.find((bucket) => bucket.Name === bucketName));
};

const findOrCreateBucket = (bucketName) => {
  return listBuckets()
          .then((buckets) => buckets.find((bucket) => bucket.Name === bucketName))
          .then((bucket) => !bucket ? createBucket(bucketName) : bucket);
};

const sendFile = (bucketName, filePath) => {
  if(fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
    const buffer = fs.createReadStream(filePath);

    return findOrCreateBucket(bucketName)
      .then((bucket) => uploadFile(bucket.Name, buffer));
  }

  return new Promise((resolve, reject) => reject({ message: "File don't exist or it's directory!"}));
}

const uploadFile = (bucketName, fileStream) => {
  const uploadParams = {Bucket: bucketName, Key: '', Body: ''};

  uploadParams.Body = fileStream;
  uploadParams.Key = md5File.sync(fileStream.path);

  return new Promise((resolve, reject) => {
    s3.upload (uploadParams, (err, data) => err ? reject(err) : resolve(data));
  });

}

/*
  https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#createMultipartUpload-property


  https://gist.github.com/kkc/8b12ef8d4a0d2842d83e
  createMultipartUpload
*/
module.exports = { createBucket, findBucket, findOrCreateBucket, listBuckets, sendFile };
