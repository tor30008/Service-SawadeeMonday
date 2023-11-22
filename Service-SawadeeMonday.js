// ต่อ DataBase Mysql
const mysql = require('mysql');
const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors({
    origin:'*'
}));

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
});

app.listen('7777',() =>{
    console.log("Welcome to port 7777");
});