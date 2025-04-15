const express = require('express');
const axios = require('axios');
const moment = require("moment")
const db = require('./db')
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
app.use(express.json());
app.get("/ingresar",async (req,res)=>{
    const { user,password } = req.body;
    console.loog({user,password})
    res.json("xDsi")
  })