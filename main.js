// Imports            
require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const session = require('express-session');
const { log } = require('console');
  
const app = express();  
const PORT = process.env.PORT || 4000;

// database connection
console.log("process.env.DB_UR:: ", process.env.DB_URI)
mongoose.connect(process.env.DB_URI, { useUnifiedTopology: true });
     
const db = mongoose.connection; 
    
// Middle Wares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
  
app.use(
  session({
    secret: "my secret key",
    saveUninitialized: true,
    resave: false, 
  })                    
);  

app.use((req,res,next)=>{
    res.locals.message = req.session.message;
    delete req.session.message ;
    next();     
})

app.set("view Engine","ejs")

db.on("error", (error) => {   
    console.log("Erroe has Occured",error);
});
 
db.once("open", () => {
    console.log("Connected to Database");
});
  

// Route Preifx 
app.use("", require("./routes/routes")); 

app.use(express.static('uploads'));

app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
}); 
    