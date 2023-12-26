// ต่อ DataBase Mysql
const mysql = require('mysql');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const multer = require('multer');
const http = require('http');
const socketIO = require('socket.io');


const app = express();
app.use(cors());
app.options('*',cors());



const uploadDirectory = 'uploads/';
const server = http.createServer(app);
const io = socketIO(server);





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
        Player_status : req.body.Player_status
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
    con.query("Select * From Player JOIN Type_player WHERE Player.Type_id = Type_player.Type_id;",function(err,result,field){
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

app.post('/Addcourt',(req,res) => {

    const data = {
        Court_name : req.body.Name,
        Court_price : req.body.Price,
        Court_status:1
    }
    const mysql = "INSERT INTO Court_badminton SET ?";
    con.query(mysql,data,function(err,result){
        try{
            res.json(result.insertId);
        }catch(error){
           console.log(error);
        }
    });
})

app.post('/Allcourt',(req,res) => {
    const mysql = "SELECT * FROM Court_badminton";
    con.query(mysql,(err,result) => {
        try{
            res.json(result);
            console.log(err);
        }catch(error){
            console.log(error);
        }
    })
});

app.post('/Editcourt',(req,res) => {
    console.log(req.body);
    let mysql = "UPDATE Court_badminton SET ? WHERE Court_Id = ?";
    let Where_id = req.body.Court_Id;
    let data = {
        Court_name : req.body.Court_name,
        Court_price : req.body.Court_price
    }
    con.query(mysql,[data,Where_id],function(err,result) {
        try{
            if(!err){
                res.json(true);
            }
            else{
                res.json(false);
                //console.log(err);
            }
        }catch(error){
            console.log(error)
        }
    })
});

app.post('/Editcourtstatus',(req,res) => { 
    console.log(req.body);
    let mysql = "UPDATE Court_badminton SET ? WHERE Court_id = ?";
    let data = {
        Court_status : req.body.Court_status
    }
    con.query(mysql,[data,req.body.Court_Id],(err,result) => {
        if(!err){
            console.log(result);
            res.json(true);
        }
        else{
            console.log(err);
        }
    })
});

app.post('/Jointoday',(req,res) => {
    const data = { 
        Player_id : req.body.Player_id,
        Joinday_status: req.body.Joinday_status
    }
    let mysql = "INSERT INTO Joinday_badminton SET ?";
    con.query(mysql,data,(err,result) => { 
        if(!err){
            console.log(result);
            res.json(result);
        }else{  
            console.log(err);
        }
    });
});

app.post("/getplayerjointoday",(req,res) => { 
    let date = new Date();
    let start_date = date.getFullYear() +':'+(date.getMonth() + 1)+":"+date.getDate()+" 00:00:00.000000";
    let end_date = date.getFullYear() +':'+(date.getMonth() + 1)+":"+date.getDate()+" 23:59:59.999999";

    let mysql = "SELECT * FROM Joinday_badminton LEFT JOIN Player ON Joinday_badminton.Player_id = Player.Player_id WHERE Joinday_badminton.Joinday_starttime BETWEEN '"+ start_date + "' AND '" +end_date+"'";
    con.query(mysql,(err,result) =>  {
        try{
            if(!err){
                res.json(result);
            }
        }catch(error){
            console.log(error);
        }
    });
})

app.post('/getplayernotjointoday',(req,res) => {
    try{
        let date = new Date();
        let start_date = date.getFullYear() +':'+(date.getMonth() + 1)+":"+date.getDate()+" 00:00:00.000000";
        let end_date = date.getFullYear() +':'+(date.getMonth() + 1)+":"+date.getDate()+" 23:59:59.999999";
        let mysql = "SELECT * FROM Player WHERE Player.Player_id NOT IN (SELECT Joinday_badminton.Player_id FROM Joinday_badminton WHERE Joinday_badminton.Joinday_starttime BETWEEN '"+start_date+"' AND '"+end_date+"')";
        con.query(mysql,(err,result) => {
            if(!err){
                res.json(result);
            }
        })
    }catch(error){
        console.log(error);
    }
})// เอาชื่อคนไม่ยังไม่ลงชื่อ วันนี้ขึ้นมาโชว์ 

app.listen('7777',() =>{
    console.log("Welcome to port 7777");
});//port ของ Restful api

server.listen('1111',() => {
    console.log('1111');
})// port ของ socket

io.on('connection', (socket) => { 
    console.log("io online");
    //console.log(socket);

    socket.emit('M','Test by server');
    socket.on("MFC",(data) => {
        console.log(data);
    });
   /* socket.on('dis',() => { 
        console.log('dis connect');
    })*/



    socket.on('join',(req) => {
        console.log(req);
        const data = { 
            Player_id : req.Player_id,
            Joinday_status: req.Joinday_status
        }

        let res = {};
        let mysql = "INSERT INTO Joinday_badminton SET ?";
        let date = new Date();
        let start_date = date.getFullYear() +':'+(date.getMonth() + 1)+":"+date.getDate()+" 00:00:00.000000";
        let end_date = date.getFullYear() +':'+(date.getMonth() + 1)+":"+date.getDate()+" 23:59:59.999999";


        con.query(mysql,data,(err,result) => { 
            if(!err){
               res['checkjointoday']=true;
               let mysql = "SELECT * FROM Joinday_badminton LEFT JOIN Player ON Joinday_badminton.Player_id = Player.Player_id WHERE Joinday_badminton.Joinday_starttime BETWEEN '"+ start_date + "' AND '" +end_date+"'";
               con.query(mysql,(err,result) => { //query เฉพาะ คนที่เราชื่อมาตีวันนี้   
                if(!err){
                    res['listjoinday'] = result;
                    mysql = "SELECT * FROM Player WHERE Player.Player_id NOT IN (SELECT Joinday_badminton.Player_id FROM Joinday_badminton WHERE Joinday_badminton.Joinday_starttime BETWEEN '"+start_date+"' AND '"+end_date+"')";
                    con.query(mysql,(err,result) => { 
                        res['listplayer'] = result 
                        socket.emit('listplayertodayFromserver',res); 
                        console.log(res);
                    })// query คนที่ยังไม่ลงชื่อวันนี้
                }
               })
            }else{  
                console.log(err);
            }
        });
    })
})