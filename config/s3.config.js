const AWS = require('aws-sdk');
require('dotenv').config();

const s3Client = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region : process.env.REGION
});
console.log(process.env.AWS_ACCESS_KEY)
console.log(process.env.AWS_SECRET_ACCESS_KEY)
console.log(process.env.REGION)
const uploadParams = {
         Bucket: "practice", 
         Body: null, // pass file body
      
};

const s3 = {};
s3.s3Client = s3Client;
s3.uploadParams = uploadParams;

module.exports = s3;

// const AWS = require('aws-sdk');

// //지역 설정
// AWS.config.update({region : 'us-west-2' , accessKeyId : "AKIA2R3ARBJUSOCS4ROL" , secretAccessKey : "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"})

 //서비스 불러오기 
//  s3 = new AWS.S3({apiVersion : '2006-03-01'})
//  s3.listBuckets(function(err , data){
//      if(err){
//          console.log("Error" , err)
//      }else{
//          console.log("Success" , data.Buckets)
//      }
//  })