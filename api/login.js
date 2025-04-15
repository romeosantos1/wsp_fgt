const express = require('express');
const router = express.Router();

const app = express();
app.use(express.json());

app.get("/ingresar",async (req,res)=>{
    const { user,password } = req.body;
    console.loog({user,password})
    res.json("xDsi")
})

module.exports = router;
