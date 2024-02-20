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

// CRUD
// C = Create post
// R = READ get
// U = UPDATE patch
// D = DELETE
// ลองเปลี่ยนเป็นแบบนี้

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

app.post('/getmatching_willplaying',(req,res) => {
    try{
        let date = new Date();
        let start_date = date.getFullYear() +':'+(date.getMonth() + 1)+":"+date.getDate()+" 00:00:00.000000";
        let end_date = date.getFullYear() +':'+(date.getMonth() + 1)+":"+date.getDate()+" 23:59:59.999999";
        let mysql = "SELECT * FROM Match_badminton  WHERE Match_timestart Between '"+start_date+"' AND '"+end_date+"'";
        var i = 0;
        con.query(mysql,(err,result) => {
            if(!err){
                //res.json(result);
                result.forEach((element,index) => {
                    if( i <= result.length){
                           con.query("SELECT Player_name FROM Player WHERE Player_id =' "+element.Teamone_playerone+"'",(err,data) => {
                            result[index]['Teamone_Playerone_name'] = data[0].Player_name;
                           })// teamone_Playerone_id ไปเอาชื่อ teamone_Playerone_name
                           con.query("SELECT Player_name FROM Player WHERE Player_id =' "+element.Teamone_playertwo+"'",(err,data) => {
                               result[index]['Teamone_Playertwo_name'] = data[0].Player_name;
                           })// teamone_Playertwo_id ไปเอาชื่อ teamone_playertwo_name
                           con.query("SELECT Player_name FROM Player WHERE Player_id =' "+element.Teamtwo_playerone+"'",(err,data) => {
                               result[index]['Teamtwo_Playerone_name'] = data[0].Player_name;
                           })// teamtwo_Playerone_id ไปเอาชื่อ teamtwo_playerone_name
                           con.query("SELECT Player_name FROM Player WHERE Player_id =' "+element.Teamtwo_playertwo+"'",(err,data) => {
                               result[index]['Teamtwo_Playertwo_name'] = data[0].Player_name;
                               result[index]['Match_timestart_convert'] = convert_time_db(element.Match_timestart);
                               if(index == (result.length - 1)){
                                res.json(result);
                                }
                           })// teamtwo_Playertwo_id ไปเอาชื่อ teamtwo_playertwo_name
                           //ถ้าถึง รอบสุดท้ายของ Loop ให้ทำการส่งค่าไปเลย ที่ไม่แยกออกมาเพราะว่ามันทำงานเร็วกว่า call back เลยต้องยัดไว้ในนี้
                    } // เช็คเพื่อให้รอบมันเท่ากัน นับจริง กับ โค๊ดนับ  
                    else{
                        //res.json(result);
                    }
                   
                    //console.log(result);
                });
               // console.log(result);
            }
            console.log(result);
        })
    }catch(error) {
        console.log(error);
    }
})

app.post('/AddShuttercock',(req,res) => { 

    var data = {
        Type_BB_name : req.body.Name,
        Type_BB_price : req.body.Price,
        Type_BB_speed : req.body.Speed,
        Type_BB_status : true
    }
    var mysql = "INSERT INTO Type_badmintonball SET ?";
    con.query(mysql,data,(err,result) => {
       if(!err){
        res.json(true);
       }
    });

});//เพิ่มลูกแบด ลงใน Type_Badmintonball

app.get('/GetShuttercock',(req,res) => { 
    let mysql = "Select * From Type_badmintonball";

    con.query(mysql,(err,result) => {
        //console.log(result);
        //console.log(err);
        res.json(result);
    });
});
app.patch('/EditShuttercock',(req,res) => {
    let mysql = "UPDATE Type_badmintonball SET ? WHERE Type_BB_id = ?";
    let data = {
        Type_BB_name : req.body.Type_BB_name,
        Type_BB_speed : req.body.Type_BB_speed,
        Type_BB_price : req.body.Type_BB_price
    }
    con.query(mysql,[data,req.body.Type_BB_id],(err,result) => {
        if(!err){
            res.json(true);
        }
    })
});
server.listen('1111',() => {
    console.log('1111');
})// port ของ socket

io.on('connection', (socket) => { 
    console.log("io online");

    socket.emit('M','Test by server');
    socket.on("MFC",(data) => {
        console.log(data);
    });


    //socket.emit("listplayertodayFromServer","First time load player today");
    socket.on('join',(req) => {
        //console.log(req);
        const data = { 
            Player_id : req.Player_id,
            Joinday_status: req.Joinday_status
        }

        let res = {};
        let mysql = "INSERT INTO Joinday_badminton SET ?";
        let date = new Date();
        let start_date = date.getFullYear() +':'+(date.getMonth() + 1)+":"+date.getDate()+" 00:00:00.000000";
        let end_date = date.getFullYear() +':'+(date.getMonth() + 1)+":"+date.getDate()+" 23:59:59.999999";

        let queue_today = {};

        con.query(mysql,data,(err,result) => { 
            if(!err){
               res['checkjointoday']=true;
               let mysql = "SELECT * FROM Joinday_badminton LEFT JOIN Player ON Joinday_badminton.Player_id = Player.Player_id WHERE Joinday_badminton.Joinday_starttime BETWEEN '"+ start_date + "' AND '" +end_date+"'";
               con.query(mysql,(err,result) => { //query เฉพาะ คนที่เราชื่อมาตีวันนี้   
                if(!err){
                    res['listjoinday'] = result;
                    mysql = "SELECT * FROM Player WHERE Player.Player_id NOT IN (SELECT Joinday_badminton.Player_id FROM Joinday_badminton WHERE Joinday_badminton.Joinday_starttime BETWEEN '"+start_date+"' AND '"+end_date+"')";
                    con.query(mysql,(err,result) => { 
                        res['listplayer'] = result;
                        socket.emit('listplayertodayFromserver',res); 
                        //console.log(res);
                    })// query คนที่ยังไม่ลงชื่อวันนี้
                }
               })
            }else{  
                console.log(err);
            }
        });
        mysql = "SELECT *  FROM Joinday_badminton JOIN Player ON Player.Player_id = Joinday_badminton.Player_id  WHERE Joinday_badminton.joinday_starttime BETWEEN '"+start_date+"' AND '"+end_date+"' ORDER BY RAND()"; 
        // Random คนที่ มาตีทั้งหมด 
        con.query(mysql,(err,result) => { 
           //console.log(result);
           res['listqueuetoday'] = result;
          //queue_today['queue_today'] = result;
           // เก็บข้อมูล queue ตัวแปล queue_today;
           //console.log(result.length);
           let Total_jointoday = result.length;
          // let Queuematch = new Array(Math.floor(Total_jointoday/4)); // Match 1 เอา 4 คนเลยหาจำนวนทีมก่อน
           let Queuematch = Array.from({length : Math.floor(Total_jointoday/4)},() => Array(4).fill(0));
           let many_notteam = (Total_jointoday / 4) - (Math.floor(Total_jointoday/4)) ;
           let cursor = 0;// ตัวไว้เช็คดึงข้อมูลเข้า 1 ทีม 4 คน
           //console.log(many_notteam);
           for(let i = 0 ; i< Queuematch.length;i++){
                for(let j = 0;j <= 3 ;j++){
                    if(j <= 3)
                    {
                        Queuematch[i][j] = result[cursor];
                        ++cursor;
                    }
                }         
           }
           console.log(Queuematch.length);
           console.log(Queuematch);
           queue_today['queue_match'] = Queuematch;
           if(many_notteam != 0){
            let row = 0; // row player ที่ยังไม่มีทีม
            if(many_notteam == 0.25) {
                var player_notteam = new Array(1);
                row = 1;
            };
            if(many_notteam == 0.5)  {
                var player_notteam = new Array(2);
                row = 2;
            };
            if(many_notteam == 0.75) {
                var player_notteam = new Array(3);
                row = 3;
            };
 
            let cursor_notteam = 0 ;
                console.log("คนขาดกี่คน :"+many_notteam);
                console.log("จำนวนคนที่ลงชื่อ : "+result.length);
                //console.log(result[result.length-1]);
                var row_true = result.length - 1;
                for(let i = 0 ; i < row ; ++i){
                    player_notteam[cursor_notteam] = result[row_true-i];
                    ++cursor_notteam;
                }
                //console.log(player_notteam);
                queue_today['player_notqueue'] = player_notteam;
               // console.log("server sent data");
           }
           else {
            console.log("All people Have Team Bro");
           }
           //socket.emit('listplayertodayFromserver',res); 
           socket.emit('queuebyserver',queue_today);
        })

    })// ลงชื่อตี Badminton

    socket.on('Select_playerone',(req) => {
        let date = new Date();
        let start_date = date.getFullYear() +':'+(date.getMonth() + 1)+":"+date.getDate()+" 00:00:00.000000";
        let end_date = date.getFullYear() +':'+(date.getMonth() + 1)+":"+date.getDate()+" 23:59:59.999999";

        let mysql = "SELECT * FROM Joinday_badminton JOIN Player ON Player.Player_id = Joinday_badminton.Player_id WHERE Joinday_badminton.joinday_starttime BETWEEN '"+start_date+"' AND '"+end_date+"' AND Joinday_status = true";
        con.query(mysql,(err,result) => { 
            socket.emit("res_Playerone-readytoplay",result);
        }); // เลือกผู้เล่นตีแบด
    })// รายชื่อเลือกผู้เล่น คนที่ 1

    socket.on("Select_playertwo",(req) => { 
        let date = new Date();
        let start_date = date.getFullYear() +':'+(date.getMonth() + 1)+":"+date.getDate()+" 00:00:00.000000";
        let end_date = date.getFullYear() +':'+(date.getMonth() + 1)+":"+date.getDate()+" 23:59:59.999999";
        let mysql = "SELECT * FROM Joinday_badminton JOIN Player ON Player.Player_id = Joinday_badminton.Player_id WHERE Joinday_badminton.joinday_starttime BETWEEN '"+start_date+"' AND '"+end_date+"' AND Joinday_status = true AND Joinday_Badminton.Player_id != "+req;   
        
        con.query(mysql,(err,result) => { 
            socket.emit("res_Playertwo-readytoplay",result);
        });
    }) // รายชื่อเลือกผู้เล่นคนที่ 2

    socket.on("Select_playerthree",(req) => {
        let date = new Date();
        let start_date = date.getFullYear() +':'+(date.getMonth() + 1)+":"+date.getDate()+" 00:00:00.000000";
        let end_date = date.getFullYear() +':'+(date.getMonth() + 1)+":"+date.getDate()+" 23:59:59.999999";
        let mysql = "SELECT * FROM Joinday_badminton JOIN Player ON Player.Player_id = Joinday_badminton.Player_id WHERE Joinday_badminton.joinday_starttime BETWEEN '"+start_date+"' AND '"+end_date+"' AND Joinday_status = true AND Joinday_Badminton.Player_id != "+req.Playerone_id+ " AND Joinday_Badminton.Player_id != "+req.Playertwo_id;   

        con.query(mysql,(err,result) => { 
            socket.emit("res_Playerthree-readytoplay",result);
        })
    });// รายชื่อเลือกผู้เล่นคนที่ 3 

    socket.on("Select_playerfour",(req) => {
        let date = new Date();
        let start_date = date.getFullYear() +':'+(date.getMonth() + 1)+":"+date.getDate()+" 00:00:00.000000";
        let end_date = date.getFullYear() +':'+(date.getMonth() + 1)+":"+date.getDate()+" 23:59:59.999999";
        let mysql = "SELECT * FROM Joinday_badminton JOIN Player ON Player.Player_id = Joinday_badminton.Player_id WHERE Joinday_badminton.joinday_starttime BETWEEN '"+start_date+"' AND '"+end_date+"' AND Joinday_status = true AND Joinday_Badminton.Player_id != "+req.Playerone_id+ " AND Joinday_Badminton.Player_id != "+req.Playertwo_id + " AND Joinday_Badminton.Player_id != "+req.Playerthree_id;

        con.query(mysql,(err,result) => {
            console.log(result);
            socket.emit("res_Playerfour-readytoplay",result);
        }); 
    });// รายชื่อไว้เลือกผู้เล่นคนที่ 4

    socket.on("Submitdraftmatch_to_server",(req) => {
        console.log(req);
        let date = new Date();
        let start_date = date.getFullYear() +':'+(date.getMonth() + 1)+":"+date.getDate()+" 00:00:00.000000";
        let end_date = date.getFullYear() +':'+(date.getMonth() + 1)+":"+date.getDate()+" 23:59:59.999999";

        let mysql =  "UPDATE Joinday_badminton SET Joinday_round = IFNULL(joinday_round, 0) + 1, Joinday_status = 'Playing' WHERE Player_id = "+req.Playerone_id+" AND Joinday_starttime BETWEEN '"+start_date+"' AND '"+end_date+"'";
        con.query(mysql,(err,result) => {
           if(err){
            console.log(err);
            console.log("Error change Status Playerone_id = True In DB Joinday_badminton status");
           }
        }); //อัพเดท Status Playerone_id จาก พร้อมตี (true) ไปเป็น Playing

        mysql =  "UPDATE Joinday_badminton SET Joinday_round = IFNULL(joinday_round, 0) + 1, Joinday_status = 'Playing' WHERE Player_id = "+req.Playertwo_id+" AND Joinday_starttime BETWEEN '"+start_date+"' AND '"+end_date+"'";
        con.query(mysql,(err,result) => {
            if(err){
                console.log("Error change Status Playertwo_id = True In DB Joinday_badminton status");
            }
        }); //อัพเดท Status Playertwo_id จาก พร้อมตี (true) ไปเป็น Playing

        mysql =  "UPDATE Joinday_badminton SET Joinday_round = IFNULL(joinday_round, 0) + 1, Joinday_status = 'Playing' WHERE Player_id = "+req.Playerthree_id+" AND Joinday_starttime BETWEEN '"+start_date+"' AND '"+end_date+"'";
        con.query(mysql,(err,result) => {
            if(err){
                console.log("Error change Status Playerthree_id = True In DB Joinday_badminton status");
            }
        }); //อัพเดท Status Playerthree_id จาก พร้อมตี (true) ไปเป็น Playing

        mysql =  "UPDATE Joinday_badminton SET Joinday_round = IFNULL(joinday_round, 0) + 1, Joinday_status = 'Playing' WHERE Player_id = "+req.Playerfour_id+" AND Joinday_starttime BETWEEN '"+start_date+"' AND '"+end_date+"'";
        con.query(mysql,(err,result) => {
            if(err){
                console.log("Error change Status Playerfour_id = True In DB Joinday_badminton status");
            }
        }); //อัพเดท Status Playerfour_id จาก พร้อมตี (true) ไปเป็น Playing

        mysql = "INSERT INTO Match_badminton SET ?";
        let data = {
            Teamone_playerone : req.Playerone_id,
            Teamone_playertwo : req.Playertwo_id,
            Teamtwo_playerone : req.Playerthree_id,
            Teamtwo_playertwo : req.Playerfour_id,
            Match_timestart: new Date(),
            Match_status : false,
            Court_id:req.Court_id
        }

        con.query(mysql,data,(err,result) => {
            if(!err){
                console.log(req.Type_BB_id);
                mysql = "INSERT INTO Match_Type_badmintonball SET ?";
                data = {
                    Match_id : result.insertId,
                    Type_badmintonball_id : req.Type_BB_id,
                    MTB_TIME : date
                }
                con.query(mysql,data,(err,result) => {
                    if(!err){
                        socket.emit("")
                    }
                    console.log(result);
                    console.log(err);
                }) // เก็บประวัติ การใช้ลูกแบดแต่ละ Match
            }
            

            //console.log(err);
        });// จัดแมต 4 คน ลง DB

    })// จัดแข่งแมต 4 คน แล้วเอาลง DB

    socket.on("Changestatus_shuttercock_to_server",(req) => {
        let mysql = "UPDATE Type_badmintonball SET Type_BB_status = ? WHERE Type_BB_id = ?";
        con.query(mysql,[req.Type_BB_status,req.Type_BB_id],(err,result) => {
            RT_getall_type_bb(socket);
        })
    });// Update status Shuttercock เปิด ปิด การใช้งานของข้อมูลพื้นฐานของลูก Type_bb_id 

    socket.on("Delete_Shuttercock_From_Client",(req) => {
        let mysql = "Delete From Type_badmintonball WHERE Type_BB_id = ?";
        con.query(mysql,[req.Type_BB_id],(err,result) => {
            if(!err){
                RT_getall_type_bb(socket);
            }
        });
    });

    socket.emit("Listmatchplaying_to_server",(req) => {
        let date = new Date();
        let start_date = date.getFullYear() +':'+(date.getMonth() + 1)+":"+date.getDate()+" 00:00:00.000000";
        let end_date = date.getFullYear() +':'+(date.getMonth() + 1)+":"+date.getDate()+" 23:59:59.999999";
        let mysql = "SELECT * FROM Match_badminton WHERE Match_timestart Between '"+start_date+"' AND '"+end_date+"'";
        con.query(mysql,(err,result) => {
            console.log(result);
            socket.on("Listmatchplaying_from_server",result);
            console.log(result);
        });
    });// ดึงข้อมูลที่ยังตีอยู่ = ยังตีไม่เสร็จขึ้นมา*/
})

const RT_getall_type_bb = (socket) => {
    let mysql = "SELECT * FROM Type_Badmintonball";
    con.query(mysql,(err,result) => {
        socket.emit("RT_getall_type_bb",result);
    });
}// ส่งข้อมูล Real time All shuttercock

const convert_time_db = (time) => { 
    var time_to_convert = new Date(time);
    var format = time_to_convert.toLocaleString('en-US',{
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit'
    }).replace(',','');
    return format;
}

/* Nodejs
    ใช้ express router พยายามแยกไฟล์เป็น module
    ใช้ ORM eg. sequlize
    ใช้ jwt token
    ใช้ .env
    set route ตาม pattern CRUD, CREATE method post, UPDATE method patch, DELETE method delete, R method GET
*/

/*
    react 
    จัด structure แยกเป็นส่วน
    แยก config ไว้ใน .env
    ใช้ await แล้วใช้ try catch ครอบไม่ต้อง then แล้ว
    ฟังชันที่ใช้บ่อยๆ ยุบเป็นอันเดียว เช่น ตอนใช้ axios แล้วต้อง .data ให้ใช้ฟังชันแล้วโยน ค่าเข้าไป
    
    await axios
      .get("http://127.0.0.1:7777/Type_player")
      .then((res) => {
        //setlisttype(res.data)
        setlisttype(res.data);
        setloading(false);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {});

    |
    |
    |
    |
    v
    try{
        let res = await axios.get("http://127.0.0.1:7777/Type_player")
        setlisttype(res.data);
        setloading(false);
    }catch(err){
        console.log(err)
    }
*/

/*

teen แนะนำ
เรียนรู้การใช้ middleware
เพิ่มการจับ x-content
ลองเรียน upload file 
เพิ่มการ conversion date


ยกตัวอย่าง Mapper
["statusCode":"00000",
"statusmessage":"file is pro",
"data":null]
*/


