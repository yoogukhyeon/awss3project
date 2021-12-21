var express = require('express');
var router = express.Router();
var moment = require('moment');
var aws = require('aws-sdk');
var multer = require('multer');
//const { v4: uuidv4 } = require('uuid');
const shortId = require('shortid');
var memorystorage = multer.memoryStorage();
var upload = multer({stroage : memorystorage});
require('dotenv').config();
var imgDomain = 'https://yoogukhyeonapp.s3.amazonaws.com/';
//mysql 연결
const db = require('../config/db')
const conn = db.init();
db.connect(conn)

router.get('/' , async (req , res) => {
    try{
        let reportList = "";
        reportList += "select no, "
        reportList += "daily_img as dImg, "
        reportList += "report_img as rImg, "
        reportList += "date_format(reg_data , '%Y-%m-%d') as regDate "
        reportList += " from images "
        
        await conn.query(reportList , [] , (err , data) => {
            if(err) console.error(err)
            
            const reportData = data
            console.log(reportData);
            res.render('index' , {reportData})
        })
        
      
    }catch(err){
        console.error("Error" , err)
    }
})


router.get('/insert' , (req , res) => {
    res.render('insert')
})

router.post('/signal/insert' , async(req , res) => {
    let result = {}
    let msg = "fail"
    let statusCode

    const {reportImg , dailyImg} = req.body
    try{

        let repostSql = "";
        repostSql += "INSERT INTO images (daily_img , report_img) "
        repostSql += "VALUES (? , ?) "
        const params = [ dailyImg , reportImg]

        await conn.query(repostSql , params , (err , data) => {
            if(err) console.log(err);
            
            console.log("data" , data)
            if(data.length <= 0){
                result = {
                    msg ,
                    statusCode : 500
                }
            }else{  
                result = {
                    msg : "success",
                    statusCode : 200
                }
                res.send(result)
            }
        })

    }catch(err){
        console.error('Error' , err)
    }
})



















// s3 이미지 업로드
router.post('/api/files/upload', upload.array('image'), function(req, res, next) {
    var toDay = moment().format('YYYYMMDD');
    var uploadType = req.body.type;
    console.log("upload type" , uploadType)
    var filePath = '';
    const uuid = shortId.generate();
    console.log("req.files" , req.files)
    try{
        //console.log(req.files);
        req.files.forEach(function (fileObj, index){
            var buffer =  fileObj.buffer;
            //var oriName = fileObj.originalname;
            var imgType = fileObj.originalname.split('.');
            var oriName = uuid+'.'+imgType[1].toLowerCase();
            var mimeType = fileObj.mimetype;
            aws.config.region = process.env.REGION; 
            aws.config.update({
                accessKeyId : process.env.AWS_ACCESS_KEY,
                secretAccessKey : process.env.AWS_SECRET_ACCESS_KEY
            });
             //서비스 불러오기 
            s3 = new aws.S3({apiVersion : '2006-03-01'})
            s3.listBuckets(function(err , data){
                if(err){
                    console.log("Error" , err)
                }else{
                    console.log("Success" , data.Buckets)
                }
            })
             filePath = 'images/'+uploadType+'/'+toDay+'/'+oriName;
             var s3_params = {
                 Bucket : "yoogukhyeonapp",
                 Key : filePath,
                 ContentType : mimeType
             }
             var s3obj = new aws.S3({ params: s3_params });
             s3obj.upload({Body : buffer}).
                 on('httpUploadProgress', function (evt) { console.log(evt) }).
                 send(function (err, data) {
                 console.log(err);
                
                 if(!err){
                     res.send({link : imgDomain + filePath});
                 }
             })
        });
    }catch(e){
        console.log(e);
    }
});


module.exports = router;