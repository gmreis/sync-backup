// Load the SDK for JavaScript
var AWS = require('aws-sdk');

// Set the region
//AWS.config.update({region: 'REGION'});

// Create S3 service object
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

const createBucket = (bucketName) => {

    // Call S3 to create the bucket
    s3.createBucket({Bucket: bucketName}, function(err, data) {
    if (err) {
       console.log("Error", err);
    } else {
       console.log("Success", data.Location);
    }
 });
}

// Call S3 to list current buckets
s3.listBuckets(function(err, data) {
    if (err) {
       console.log("Error", err);
    } else {
       console.log("Bucket List", data.Buckets);
    }
 });


 // Create the parameters for calling createBucket
var bucketParams = {
    Bucket : BUCKET_NAME
 };

  // Call S3 to create the bucket
 s3.listObjects(bucketParams, function(err, data) {
    if (err) {
       console.log("Error", err);
    } else {
       console.log("Success", data);
    }
 });


 // call S3 to retrieve upload file to specified bucket
var uploadParams = {Bucket: process.argv[2], Key: '', Body: ''};
var file = process.argv[3];

var fs = require('fs');
var fileStream = fs.createReadStream(file);
fileStream.on('error', function(err) {
  console.log('File Error', err);
});
uploadParams.Body = fileStream;

var path = require('path');
uploadParams.Key = path.basename(file);

// call S3 to retrieve upload file to specified bucket
s3.upload (uploadParams, function (err, data) {
  if (err) {
    console.log("Error", err);
  } if (data) {
    console.log("Upload Success", data.Location);
  }
});
