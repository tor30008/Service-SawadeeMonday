// ต่อ DataBase Mysql
const mysql = require('mysql');
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const multer = require('multer');

const uploadDirectory = 'uploads/';

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,uploadDirectory);
    },
    filename:function(req,file,cb){
        cb(null,file.fieldname+'-'+Date.now()+'.jpg');
    }
});

const fileuploadMiddleware = (res,req,next) => {
    if(res.file){
        console.log("Have file");
    }
    else{
        console.log("Dont have file");
    }
    next();
}

const upload = multer({storage:storage})

app.use(cors({
    origin:'*'
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
const con = mysql.createConnection({
    host:"localhost",
    port:8889,
    user:"root",
    password:"password",
    database:"CourtBadminton_DB"
});

con.connect(function(err){

if(err) throw console.log(err);
    //console.log(con.query("SELECT * FROM Type_player"))
    //return console.log("ต่อไม่ติดวะ");

console.log("Connect Database");

});


// ทำให้เป็น API 


app.use((req,res,next) => {

        // Website you wish to allow to connect
        res.setHeader('Access-Control-Allow-Origin', '*');

        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    
        // Request headers you wish to allow
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    
        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        res.setHeader('Access-Control-Allow-Credentials', true);
    
        // Pass to next layer of middleware
        next();

})
app.get('/Type_player',(req,res) => {
    con.query("Select * From Type_player",function(err,result,field){
        res.json(result);
   });
});// API ดึงประเภทมือขึ้นมา



app.use('/uploads', express.static('uploads'));
app.post('/Add_player',upload.single('image'),(req,res) =>{

    upload.single(req.body.image);

    const path_server  = "http://127.0.0.1:7777/"+uploadDirectory+req.file.filename; // ที่อยู่ในการลง DB แล้วเวลาเรียกก็สามารถใช้ได้เลย

    //res.json(true);
    const sql = "INSERT INTO Player SET ?";
    const value = {
        Player_name:req.body.Name,
        Player_tel:req.body.Phone,
        Type_id:req.body.Type,
        Player_photo:path_server,
        Player_registertime:new Date(),
        Player_status:1
    };
   
    con.query(sql,value,function(err,result){
        try{
            res.json(result.insertId);
        }catch(err){
            console.log(err);
        }
        console.log("Number of recode inserted:" + result.insertId);
        console.log(req.file);
    });
});//เพิ่มผู้เล่นใหม่เข้ามาในระบบ

app.post('/Deleteplayer',(req,res)=>{
    
    const wheredata = {
        Player_id : req.body.Player_id
    }
    const sql = "UPDATE Player SET? WHERE ?";
    const update_data = {
        Player_status : 0
    }
    
    con.query(sql,[update_data,wheredata],(err,results) =>{
        try{
            if(results){
                res.json(true);
            }
        }catch(error){
            console.log(error);
        }
    });
    //con.end();
});

app.get('/Allplayer',(req,res) =>{
    con.query("Select * From Player",function(err,result,field){
        res.json(result);
    });
});


app.post('/Player',(req,res) => {
    const wheredata = {
        Player_id : req.body.Player_id
    }
    const mysql = "SELECT Player_id,Player_name,Player_tel,Type_id,Player_photo From Player WHERE ?";

    con.query(mysql,[wheredata],(error,results) => {
        if(error){
            console.log(error);
        }
        else{
            res.json(results);
        }
    })
});

app.post('/Editplayer',upload.single('image'),fileuploadMiddleware,(req,res) => {

    console.log(req.body);

    let value;
    let mysql;

    if(req.file){
        const path_server  = "http://127.0.0.1:7777/"+uploadDirectory+req.file.filename; // ที่อยู่ในการลง DB แล้วเวลาเรียกก็สามารถใช้ได้เลย
        mysql = "UPDATE Player SET ? WHERE Player_id = ?";
        value = {
            Player_name : req.body.Name,
            Player_tel : req.body.Phone,
            Type_id : req.body.Type,
            Player_photo : path_server,
        }
    }
    else{
        mysql = "UPDATE Player SET ? WHERE Player_id = ?";
        value = {
            Player_name : req.body.Name,
            Player_tel : req.body.Phone,
            Type_id : req.body.Type,
        }
    }
    con.query(mysql,[value,req.body.Player_id],(err,result) => {
        try{
            if(!err){
                res.json(true);
            }else{
                res.json(false);
            }
        }catch(error){
            console.error(err);
        }
    });
})

app.listen('7777',() =>{
    console.log("Welcome to port 7777");
});