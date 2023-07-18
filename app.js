//const express = require('express');
import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import web from "./app/routes/web.js";
import api from "./app/routes/api.js";
import session from "express-session";
import multer from "multer";
import rateLimit from "express-rate-limit";
//import database from "./app/config/database.js"
var __dirname = path.resolve();
const app = express();

app.use(session({
    secret: 'yfasfdsawerwe',
    resave: true,
    saveUninitialized: true
}));
// set the view engine to ejs
app.set("view engine", "ejs");
app.set("views", __dirname + '/app/views');
app.use(express.static(__dirname + '/public'));


// rate limit 
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // limit each IP to 100 requests per windowMs
    message: "Too many requests, please try again later",
});
app.use(limiter);
// end rate limit 

//multer file upload code
//const upload = multer({ dest: 'uploads/' });
const DIR = './public/';
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        const fileName = file.originalname.toLowerCase().split(' ').join('-');
        cb(null, uuidv4() + '-' + fileName)
    }
});
var upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
});

// Body-parser middleware
//app.use(express.json());
//app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));




// allow for call api on other server
app.disable("x-powered-by"); // For security
app.use(cors({ origin: true, credentials: true }));


// API_ROUTER START
app.use("/api", api);
app.use("/", web);

dotenv.config();




// SERVER-START HERE
const PORT = process.env.PORT || 3034;
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(PORT, () => {
            console.log("Server is listening on port " + PORT);
        });
    })
    .catch((err) => {
        console.log("Error Occurred");
    });

/*
app.listen(PORT, (error) => {
  if (!error)
      console.log("Server is Successfully Running,and App is listening on port " + PORT)
  else
      console.log("Error occurred, server can't start", error);
}
);*/
