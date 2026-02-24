const mongoose=require('mongoose');
require('dotenv').config();
const mangodburl=process.env.MONGODB_URL_LOCAL;
//const mangodburl=process.env.MONGODB_URL;

mongoose.connect(mangodburl,{
    useNewUrlParser:true,
    useUnifiedTopology:true
});

const db =mongoose.connection;

db.on('connected',()=>{
    console.log("connected to mongodb server");
});
db.on('disconnected',()=>{
    console.log("disconnected to mongodb server");
});
db.on('error',(err)=>{
    console.error("mongodb  connection error ",err);
});
//export the database connection
module.exports=db;
