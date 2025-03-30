const express = require('express');
const axios = require('axios');
const db = require('./db')

const app = express();
app.use(express.json());


/*const accessToken = 'EAA4UBHuigRoBOxZAZAmvVjDDnvFl4CtpPZA4ZBTjOIXXzS7ZALL2rp3ZCyxHIdIvmgoHARBwuoXGpHk3KQavN48jb1C49Ajjp8iqLTg2RNes27wFJf1EaReGnIW6A9tFPuxDdqdrLf7Nxt4EDpuSvDdBqJG9KDtHVPYZCBNiBaSZCyfGifxkGOOtkWi9eMFo7ZCDMjszVDBZB5e2gmdSa4XQcvtEOoKwZDZD';
const phoneNumberId = '615332014992887';*/
const listarUsuarios = (({RUC})=>{
  return new Promise(async (resolve,reject)=>{
    const query = db.select('*').from('usuario as u').join("usuario_key as uk","uk.usuario_id","u.id")
    if(RUC){
      query.where({RUC}).first()
    }
    const datos = await query
    .finally(() => {
      db.destroy(); // Cerrar la conexión después de la consulta
    });
    resolve(datos)
    })
})
const listarPlantillas = (({RUC})=>{
  return new Promise(async (resolve,reject)=>{
    const {token,bussines_id} = await listarUsuarios({RUC}) 
    const url = `https://graph.facebook.com/v22.0/${bussines_id}/message_templates`
    console.log({url,token})
    axios.get(
      url,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    ).then(response=>{
      //console.log(response.data)
      resolve(response.data)
    })
    //console.log({res})  
  })
})
const actualizarPlantillas =  ( ({RUC})=>{
  return new Promise(async(resolve,reject)=>{
    /*const usuario = await listarUsuarios({RUC})
    const plantillas = await listarPlantillas({RUC})*/
    const arrIns = []
    Promise.all([
      listarUsuarios({RUC}),
      listarPlantillas({RUC})
    ]).then(([usuario,plantillas])=>{
      plantillas = plantillas.data
      plantillas.forEach()
      console.log({usuario,plantillas})
      resolve(usuario)
    })
  })
})
app.post('/send-message', async (req, res) => {   
    const { to, message, RUC } = req.body;

    if (!to ) {
      return res.status(400).json({ error: 'El número de teléfono y el mensaje son necesarios.' });
    }
    const {token,api_key} = await listarUsuarios({RUC}) 
    try {
      const response = await axios.post(
        `https://graph.facebook.com/v22.0/${api_key}/messages`,
        {
          messaging_product: 'whatsapp',
          to,
          text: { body: message }
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log(token)
      res.json(response.data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Ocurrió un error al enviar el mensaje.' });
    }
  });
app.post('/send-template', async (req, res) => {   
    const { to,RUC } = req.body;
  
    if (!to ) {
      return res.status(400).json({ error: 'El número de teléfono es necesario.' });
    }
    const {token,api_key} = await listarUsuarios({RUC}) 
    
    try {
      const response = await axios.post(
        `https://graph.facebook.com/v22.0/${api_key}/messages`,
        {
          messaging_product: 'whatsapp',
          to,
          "type": "template",
          template: {
            "name": "hello_world",
            "language": {
              "code": "en_US"
            },
        }
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log(token)
      res.json(response.data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Ocurrió un error al enviar el mensaje.' });
    }
  });
app.post('/show-usuario',async(req,res)=>{
  const { RUC } = req.body;
  const datos = await listarUsuarios({RUC})
  console.log(datos)
  res.json(datos);  
})  
app.get('/show-template',async(req,res)=>{
  const { RUC } = req.body;
  const datos = await listarPlantillas({RUC})
  //console.log(datos)
  res.json(datos);  
})  
app.post('/registrar-usuario',async(req,res)=>{
  const {RUC,razon_social,direccion,email,token,api_key,bussines_id} = req.body;
  const [ID] = await db("USUARIO").insert({RUC,razon_social,direccion,email,bussines_id,token})
  await db("usuario_key").insert({api_key,USUARIO_ID:ID}).finally(() => {
    db.destroy(); // Cerrar la conexión después de la consulta
  });
  //res.json("Registrado correctamente con el codigo",ID);
  console.log("Xd")
  res.json("Registrado Correctamente");  
})
app.post("/actualizar-plantilla",async(req,res)=>{
  const { RUC } = req.body;
  const datos = await actualizarPlantillas({RUC})
  //const usuarios = await listarUsuarios({RUC})
  //const datos = await listarPlantillas({RUC})
  //console.log({datos})
  res.json("(Y)");  
})
  // Inicia el servidor
  const port = 3001;
  app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
  });