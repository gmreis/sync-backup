const fs =  require('fs');
const AWS = require('aws-sdk');
const md5File = require('md5-file')

AWS.config.loadFromPath('./cred.json');

const s3 = new AWS.S3({apiVersion: '2006-03-01'});

const PART_SIZE = 1024 * 1024 * 5;
const MAX_UPLOAD_TRIES = 3;

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
    let fileSize = fs.lstatSync(filePath).size;
    if (fileSize > PART_SIZE * 2) {
      return findOrCreateBucket(bucketName)
        .then((bucket) => createMultipartUpload(bucket.Name, filePath))
        .then((multipart) => multipartUpload(multipart, bucketName, filePath))
        .then((doneParams) => completeMultipartUpload(doneParams));
    } else {
      return findOrCreateBucket(bucketName)
        .then((bucket) => uploadFile(bucket.Name, filePath));
    }
  }

  return new Promise((resolve, reject) => reject({ message: "File don't exist or it's directory!"}));
}

const uploadFile = (bucketName, filePath) => {
  const uploadParams = {Bucket: bucketName, Key: '', Body: ''};

  uploadParams.Body = fs.readFileSync(filePath);
  uploadParams.Key = md5File.sync(filePath);

  return new Promise((resolve, reject) => {
    s3.upload (uploadParams, (err, data) => err ? reject(err) : resolve(data));
  });
}

const createMultipartUpload = (bucketName, filePath) => {
  const fileKey = md5File.sync(filePath);
  var multiPartParams = {
    Bucket: bucketName,
    Key: fileKey
  };

  return new Promise((resolve, reject) => {
    s3.createMultipartUpload(multiPartParams, (mpErr, multipart) => mpErr ? reject(mpErr) : resolve(multipart));
  });
};

const multipartUpload = (multipart, bucketName, filePath) => {
  return new Promise((resolve, reject) => {

    let sizeBuffer = fs.lstatSync(filePath).size;
    let partNum = 1;
    let totalParts = Math.ceil(sizeBuffer / PART_SIZE);

    let multipartMap = {
      Parts: []
    };
    let uploadResult;

    const readableStream = fs.createReadStream(filePath, {highWaterMark: PART_SIZE});
    readableStream.on('data', async (buffer) => {
      readableStream.pause();

      let partParams = {
        Body: buffer,
        Bucket: bucketName,
        Key: multipart.Key,
        PartNumber: partNum,
        UploadId: multipart.UploadId
      };

      uploadResult = await uploadPart(partParams)
        .catch((err) => {
          readableStream.destroy();
          reject(err);
          return false;
        });

      if (uploadResult) {
        multipartMap.Parts[partParams.PartNumber - 1] = {
          ETag: uploadResult.ETag,
          PartNumber: partParams.PartNumber
        };

        if (partParams.PartNumber === totalParts) {
          const doneParams = {
            Bucket: bucketName,
            Key: multipart.Key,
            MultipartUpload: multipartMap,
            UploadId: multipart.UploadId
          };

          resolve(doneParams);
        } else {
          partNum++;
          readableStream.resume();
        }
      }
    });
  });
};

const uploadPart = (partParams) => {
  return new Promise((resolve, reject) => tryUploadPart(resolve, reject, partParams));
};

const tryUploadPart = (resolve, reject, partParams, tryNum) => {
  tryNum = tryNum || 1;

  s3.uploadPart(partParams, (multiErr, mData) => {
    if (multiErr && tryNum < MAX_UPLOAD_TRIES) {
        tryUploadPart(resolve, reject, partParams, tryNum + 1);
    } else if(multiErr) {
        reject({message: `Failed uploading part #${partParams.PartNumber}: ${multiErr.message}`});
    } else {
      resolve(mData);
    }
  });
}

const completeMultipartUpload = (doneParams) => {
  return new Promise((resolve, reject) => {
    s3.completeMultipartUpload(doneParams, (err, data) => err ? reject(err) : resolve(data));
  });
}

/*
  https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#createMultipartUpload-property


  https://gist.github.com/kkc/8b12ef8d4a0d2842d83e
  createMultipartUpload
*/
module.exports = { createBucket, findBucket, findOrCreateBucket, listBuckets, sendFile };
