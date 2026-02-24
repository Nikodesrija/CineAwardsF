const express=require('express');
require('dotenv').config()
const cors = require('cors');
const app=express();
const db=require('./db');
const path=require('path');
app.use(express.static('frontend'));
app.use(express.static(path.join(__dirname, '../frontend')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'signup.html'));
});
app.use('/images', express.static(path.join(__dirname, 'frontend/images')));

app.use(express.json());     //req.body
app.use(express.urlencoded({ extended: true }));
app.use(cors());
const PORT=process.env.PORT ||3000;



//Import the router files
const userRoutes = require('./routes/UserRoutes');
const nomineeRoutes = require('./routes/nomineeRoutes');
const categoryRoutes = require('./routes/categoriesRoutes');
const resultsRoutes = require('./routes/results');
const notificationsRoutes = require('./routes/notifications');
const winRoutes=require('./routes/winner');
const recommendationRoutes = require("./routes/recommendations");
app.use("/", recommendationRoutes);
app.use('/notifications', notificationsRoutes);
app.use('/results', resultsRoutes);

// Use the routers
app.use('/user', userRoutes);
app.use('/nominee', nomineeRoutes);
app.use('/category', categoryRoutes);
app.use('/win',winRoutes);
app.listen(PORT,()=>{
    console.log('listening on port 3000');
})