// ต่อ DataBase Mysql
const mysql = require('mysql');
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');

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
    console.log("Type Player");
    con.query("Select * From Type_player",function(err,result,field){
        res.json(result);
   });
});// API ดึงประเภทมือขึ้นมา

app.post('/Add_player',(req,res) =>{

    //res.json(true);
    const sql = "INSERT INTO Player SET ?";
    const value = {
        Player_name:req.body.Name,
        Player_tel:req.body.Phone,
        Type_id:req.body.Type,
        Player_photo:req.body.Photo,
        Player_registertime:new Date()
    };
   
    con.query(sql,value,function(err,result){
        try{
            res.json(result.insertId);
        }catch(err){
            console.log(err);
        }
        console.log("Number of recode inserted:" + result.insertId);
    });
});//เพิ่มผู้เล่นใหม่เข้ามาในระบบ

app.get('/Allplayer',(req,res) =>{
    console.log("Hello Function get All Player");
    con.query("Select * From Player",function(err,result,field){
        res.json(result);
    });
});

app.listen('7777',() =>{
    console.log("Welcome to port 7777");
});