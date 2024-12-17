const express = require("express")
const cors = require('cors');
const mongoose = require("mongoose")
const app = express()
const dataRoutes = require("./routes/Routes")
const bodyparser = require('body-parser')
const path = require('path');


app.use(bodyparser.json());

app.use(cors({
    origin: 'http://localhost:3000',  // Add both frontend URLs
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


mongoose.connect("mongodb+srv://mallikaa0214:YfULALOhS8kaNHfR@socialnetwork.mze6o.mongodb.net/socialnetwork") ; 

// password: YfULALOhS8kaNHfR

const db = mongoose.connection;  

db.on('error', console.error.bind(console, 'MongoDB connection error:'));      
db.once('open', function() { 
    console.log("Connected to MongoDB database");     
});

app.use('/',dataRoutes) 

const PORT = process.env.PORT || 5000 

app.listen(PORT, () => {  
    console.log("Server running on port: " + PORT)     
}) 