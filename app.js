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
app.use(cors());




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
