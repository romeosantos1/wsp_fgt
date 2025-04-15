const express = require('express');
const axios = require('axios');
const moment = require("moment")
const db = require('./db')
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
app.use(express.json());
app.use(cors());
const saltRounds = 10;
const firma = "FraGoTe"

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',  // La versión de OpenAPI (Swagger 3.0)
    info: {
      title: 'fraTalk',
      version: '1.0.0',
      description: 'Una API de comunicacion brindada por Fragote Software Factory', // Descripción general
      contact: {
        name: 'Anthony Santos',
        email: 'Anthony.santos@fragote.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001', // URL base de la API
      },
    ],
  },
  // Ruta de los archivos que contienen los comentarios para la documentación Swagger
  apis: ['./index.js'],  // Aquí especificas la ruta a tus archivos de rutas
};



const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Configurar Swagger UI para visualizar la documentación
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/*const accessToken = 'EAA4UBHuigRoBOxZAZAmvVjDDnvFl4CtpPZA4ZBTjOIXXzS7ZALL2rp3ZCyxHIdIvmgoHARBwuoXGpHk3KQavN48jb1C49Ajjp8iqLTg2RNes27wFJf1EaReGnIW6A9tFPuxDdqdrLf7Nxt4EDpuSvDdBqJG9KDtHVPYZCBNiBaSZCyfGifxkGOOtkWi9eMFo7ZCDMjszVDBZB5e2gmdSa4XQcvtEOoKwZDZD';
const phoneNumberId = '615332014992887';*/
const listarUsuarios = (({ RUC, campos }) => {
  return new Promise(async (resolve, reject) => {
    if (!campos) {
      campos = ['u.*', 'uk.*', 'uk.id as USUARIO_KEY_ID']
    }
    const query = db.select(campos).from('usuario as u').join("usuario_key as uk", "uk.usuario_id", "u.id")
    if (RUC) {
      query.where({ RUC }).first()
    }
    const datos = await query
    resolve(datos)
  })
})
const listarPlantillas = (({ RUC }) => {
  return new Promise(async (resolve, reject) => {
    const { token, bussines_id } = await listarUsuarios({ RUC })
    const url = `https://graph.facebook.com/v22.0/${bussines_id}/message_templates`
    axios.get(
      url,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    ).then(response => {
      //console.log(response.data)
      resolve(response.data)
    })
    //console.log({res})  
  })
})
const addPaquete = (({ RUC, paquete }) => {
  return new Promise(async (resolve, reject) => {
    const { ID, razon_social } = await listarUsuarios({ RUC })
    const bolsa = await db("paquete").where({ id: paquete }).first()
    const hoy = new Date()
    const inicio = moment().format("DD/MM/YYYY")
    const fin = moment(hoy.setDate(hoy.getDate() + bolsa.duracion)).format("DD/MM/YYYY")
    const dataIns = {
      USUARIO_ID: ID,
      paquete_id: bolsa.id,
      inicio_vigencia: inicio,
      FIN_VIGENCIA: fin
    }
    await db("compra").insert(dataIns)
    resolve({ razon_social, bolsa, inicio, fin })
  })
})
const buscarPlantilla = (({ ID, title }) => {
  return new Promise(async (resolve, reject) => {
    const data = await db("template").where({ title, id_usuario: ID }).first()
    resolve(data)
  })
})
const actualizarPlantillas = async ({ RUC }) => {
  try {
    const { ID } = await listarUsuarios({ RUC });
    if (!ID) throw new Error('Usuario no encontrado');
    const plantillas = await listarPlantillas({ RUC });
    if (!plantillas || !plantillas.data) throw new Error('No se encontraron plantillas');
    const arrIns = plantillas.data.map(v => {
      const params = {
        id_template: v.id,
        idioma: v.language,
        title: v.name,
        id_usuario: ID
      };

      v.components.forEach(w => {
        if (w.type === 'BODY') {
          params.contenido_template = w.text;
        }
      });

      return db('template')
        .insert(params)
        .onConflict('id_template')
        .merge([
          'id_template',
          'idioma',
          'title',
          'contenido_template',
          'id_usuario'
        ]);
    });

    await Promise.all(arrIns); // ⚡️ Asegura que todas las consultas terminen antes de continuar.

    return 'Actualización completada';
  } catch (error) {
    console.error('Error en actualizarPlantillas:', error);
    return 'Error en actualización';
  }
};
const registrarInfoMensaje = async ({ msg, etk }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const template_id = await db.insert(msg).into("mensaje_template")
      if (etk && etk.length > 0) {
        const parameters = []
        etk.forEach(v => {
          const objIns = {
            orden_template: v.parametro,
            valor: v.contenido,
            mensaje_template_mensaje_id: template_id,
            tipo: 'body',
            template_id: msg.template_id_template
          }
          parameters.push(db.insert(objIns).into("template_etiqueta"))
        })
        await Promise.all(parameters)
      }
      resolve("Registrado correctamente")
    } catch (e) {
      console.log(e)
      reject("no se pudo registrar la información")
    }
  })
}
const validarSaldo = async ({ ID }) => {
  /**
   SELECT c.id as idenvio,c.*,p.*
  FROM compra as c join paquete p on p.id=c.paquete_id WHERE usuario_id =2 and 
  '2025.04.03' between inicio_vigencia and FIN_VIGENCIA having p.cantidad > (select count(1) from mensaje_template mt where mt.id_compra=c.id);

   */
  return new Promise((resolve, reject) => {
    const hoy = moment().format("YYYY.MM.DD")
    const subString = db.from("mensaje_template as mt").whereRaw("mt.id_compra=c.id").select(db.raw("count(1)"))
    const sql = db("compra as c")
      .join("paquete as p", "p.id", "c.paquete_id")
      .where("usuario_id", ID)
      .whereBetween(db.raw(`(select CURDATE())`), [db.raw("inicio_vigencia"), db.raw("FIN_VIGENCIA")])
      .having("p.cantidad", ">", db.raw(`(${subString})`))
      .first()
      .select("c.id as idenvio", "c.*", "p.*")
    resolve(sql)
  })
}
const addTemplate = async ({ name, contenido, RUC }) => {
  return new Promise(async (resolve, reject) => {
    const { ID, token, bussines_id } = await listarUsuarios({ RUC })
    const components = contenido
    const body = {
      name,
      "category": "UTILITY",
      "parameter_format": "NAMED",
      "allow_category_change": true,
      "language": { "code": "es" },
      components
    }
    const url = `https://graph.facebook.com/v22.0/${bussines_id}/message_templates`
    await axios.post(
      url,
      {
        name: name,
        "category": "UTILITY",
        //"parameter_format": "NAMED",
        "allow_category_change": true,
        "language": "es",
        components
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }

    ).then(response => {
      //console.log(response.data)
      resolve(response.data)
    }).catch(e => {
      reject(e)
    })
    //console.log({usuario,RUC,body})
    //resolve(body)
  })
}
const showUsuarios = ({ username, clave }) => {
  return new Promise(async (resolve, reject) => {
    const query = db("usuarios as u").leftJoin("usuario as us", "us.id", "u.id_cliente").where({ usuario: username, estado: 1 }).first()
    const data = await query
    resolve(data)
  })
}
const generarAleatoria = (longitud) => {
  return new Promise((resolve, reject) => {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let clave = '';

    for (let i = 0; i < longitud; i++) {
      const randomIndex = Math.floor(Math.random() * caracteres.length);
      clave += caracteres[randomIndex];
    }
    resolve(clave)
  })
}
const insertarUsuario = ({ user, usuario_nombre, id_cliente, password }) => {
  return new Promise(async (resolve, reject) => {
    password = await bcrypt.hash(password, 10);
    const query = db('usuarios')
      .insert({ usuario: user, usuario_nombre, id_cliente, clave: password })
      .onConflict('user')
      .merge([
        'clave'
      ]);
    //console.log(query.toString())
    await query
    resolve()
  })

}
const decodeToken = (token => {
  return new Promise(async (resolve, reject) => {
    const decoded = await jwt.verify(token, firma)
    resolve(decoded)
  })
})
const listUsers = (({RUC,usuario,id_cliente}) => {
  return new Promise((resolve, reject) => {
    const query = db("usuarios as us")
      .leftJoin("usuario as u", "u.id", "us.id_cliente")
      .select("us.usuario", "usuario_nombre", "u.razon_social")
    if (RUC) {
      query.where({ RUC })
    }
    if(usuario){
      query.where({usuario}).where("id_cliente","<>",id_cliente)
    }
    console.log(query.toString())
    resolve(query)
  })
})
app.post('/send-message', async (req, res) => {
  const { to, message, RUC } = req.body;

  if (!to) {
    return res.status(400).json({ error: 'El número de teléfono y el mensaje son necesarios.' });
  }
  const { token, api_key } = await listarUsuarios({ RUC })
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

/**
 * @swagger
 * /send-template:
 *   post:
 *     summary: Enviar una plantilla de mensaje
 *     tags:
 *        - Envio
 *     description: Envia un mensaje usando una plantilla de WhatsApp a un número.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               to:
 *                 type: string
 *                 description: El número de teléfono del destinatario.
 *               RUC:
 *                 type: string
 *                 description: El RUC del usuario.
 *               title:
 *                 type: string
 *                 description: El título de la plantilla.
 *               content:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     parametro:
 *                       type: string
 *                       description: El nombre del parámetro de la plantilla.
 *                     contenido:
 *                       type: string
 *                       description: El contenido del parámetro.
 *     responses:
 *       200:
 *         description: Plantilla enviada exitosamente.
 *       400:
 *         description: Error en la solicitud.
 *       500:
 *         description: Error interno del servidor.
 */

app.post('/send-template', async (req, res) => {
  const { to, RUC, title, content } = req.body;
  if (!to) {
    return res.status(400).json({ error: 'El número de teléfono es necesario.' });
  }
  let msg = 'Ocurrió un error al enviar el mensaje.'

  try {
    const { token, api_key, ID, USUARIO_KEY_ID } = await listarUsuarios({ RUC })
    const { plantilla, idioma, id_template } = await buscarPlantilla({ ID, title })
    const data = await validarSaldo({ ID })
    if (data && data.idenvio) {
      const template = {
        "name": title,
        "language": {
          "code": idioma
        },
      }
      if (content && content.length > 0) {
        const parameters = []
        content.forEach(v => {
          objIns = { "type": "text" }
          objIns.parameter_name = v.parametro
          objIns.text = v.contenido
          parameters.push(objIns)
        })
        template.components = [{
          "type": "body",
          parameters
        }]
      }
      const response = await axios.post(
        `https://graph.facebook.com/v22.0/${api_key}/messages`,
        {
          messaging_product: 'whatsapp',
          to,
          "type": "template",
          template
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const msg = {
        USUARIO_KEY_ID,
        telefono_recepcion: to,
        fh_envio: new Date(),
        template_id_template: id_template,
        id_compra: data.idenvio
      }
      await registrarInfoMensaje({ msg, etk: content })
      res.json(response.data);
    } else {
      msg = 'No tiene saldo Disponible'
      throw new Error(msg);
    }
  } catch (e) {
    console.error(e);
    res.status(500).json(msg);
  }
});
app.post('/show-usuario', async (req, res) => {
  const { RUC, campos, token } = req.body;
  const datos = await listarUsuarios({ RUC, campos })
  //const wToken = decodeFirma()
  res.json(datos);
})
app.get('/show-template', async (req, res) => {
  const { RUC } = req.body;
  const datos = await listarPlantillas({ RUC })
  //console.log(datos)
  try {
    res.json(datos);
  } catch (e) {
    console.log(e)
  }

})
app.post('/registrar-usuario', async (req, res) => {
  let { RUC, razon_social, DIRECCION, EMAIL, token, api_key, bussines_id, ID } = req.body;
  console.log({ RUC, razon_social, DIRECCION, EMAIL, token, api_key, bussines_id })
  try {
    const dataIns = { RUC, razon_social, DIRECCION, EMAIL, bussines_id, token }
    if (ID) {
      dataIns.ID = ID
    }
    if (!ID) {
      const DATA = db("USUARIO").insert(dataIns)
      ID = DATA.ID
      await db("usuario_key").insert({ api_key, USUARIO_ID: ID })
      res.json("Registrado Correctamente");
    } else {
      await db("USUARIO").update(dataIns).where({ ID })
      await db("usuario_key").update({ api_key }).where({ USUARIO_ID: ID })
      res.json("Registrado Correctamente");

    }
    /*const data = await db("USUARIO").insert(dataIns)
      .onConflict('RUC').merge(['razon_social', 'direccion', 'email', 'bussines_id', 'token']);
    if (!ID) {
      ID = data.ID
      console.log({ ID })
    }
    await db("usuario_key").insert({ api_key, USUARIO_ID: ID }).onConflict('USUARIO_ID').merge(['api_key']);*/
    //res.json("Registrado correctamente con el codigo",ID);
  } catch (e) {
    console.log(e)
    res.status(400).json("No se pudo guardar la informacion")
  }
})
/**
 * @swagger
 * /actualizar-plantilla:
 *   post:
 *     summary: Actualiza la plantilla correspondiente al RUC proporcionado.
 *     tags:
 *       - Plantillas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               RUC:
 *                 type: string
 *                 example: "20123456789"
 *                 description: RUC de la empresa cuya plantilla se va a actualizar
 *     responses:
 *       200:
 *         description: Plantilla actualizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: Actualizado Correctamente
 *       400:
 *         description: Datos faltantes o inválidos
 *       500:
 *         description: Error del servidor al actualizar la plantilla
 */
app.post("/actualizar-plantilla", async (req, res) => {
  const { RUC } = req.body;
  await actualizarPlantillas({ RUC })
  res.json("Actualizado Correctamente");
})
app.post("/add-paquete", async (req, res) => {
  const { RUC, paquete } = req.body;
  const resp = await addPaquete({ RUC, paquete })
  const { inicio, fin } = resp
  res.json(`El usuario ${resp.razon_social} adquirió ${resp.bolsa.cantidad} mensajes, validos del ${inicio} al ${fin}`);

})
app.get("/listar-envios", async (req, res) => {
  const { fecini, fecfin } = req.body
})

/**
 * @swagger
 * /add-template:
 *   post:
 *     summary: Agregar una nueva plantilla
 *     tags:
 *        - Plantillas
 *     description: Este endpoint agrega una nueva plantilla a la base de datos.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: El nombre de la plantilla.
 *               RUC:
 *                 type: string
 *                 description: El RUC de la empresa.
 *               contenido:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                      type:
 *                       type: string
 *                       description: El nombre del parámetro de la plantilla [HEADER,BODY,FOOTER,BUTTONS].
 *                      format:
 *                        type: string
 *                        description: formato del componente en el caso sea header [IMAGE,TEXT]
 *                      text:
 *                        type: string
 *                        description: contenido en modo de texto, colocar las etiquetas entre doble llaves
 *                        
 *     responses:
 *       200:
 *         description: Plantilla agregada exitosamente.
 *       400:
 *         description: Datos incorrectos en la solicitud.
 */
app.post("/add-template", async (req, res) => {
  const { name, contenido, RUC } = req.body;
  // Lógica para agregar la plantilla aquí
  try {
    const resp = await addTemplate({ name, contenido, RUC })
    res.json(resp)
  } catch (e) {
    res.json(e)

  }
  //res.status(200).send("Plantilla agregada exitosamente");
});
app.post("/login", async (req, res) => {
  const { user, password } = req.body;
  if (!user || !password) {
    return res.status(400).json({ error: 'Ambos datos son obligatorios' });
  }
  const data = await showUsuarios({ username: user })
  if (data) {
    const { clave, usuario_nombre, id_cliente, RUC } = data
    bcrypt.compare(password, clave, function (err, result) {
      if (result) {
        console.log('✅ Contraseña válida');
        const objData = {
          status: 'Ok',
          nombre: usuario_nombre,
          id_cliente, RUC, user
        }
        objData.token = jwt.sign(objData, firma)
        res.json({ ...objData, ...{ message: "Ingreso Correcto" } })
      } else {
        console.log('❌ Contraseña incorrecta');
        res.json({ message: '❌ Contraseña incorrecta' })
      }
    });
  } else {
    console.log('Usuario o Contraseña incorrecta');
    res.json({ message: 'Usuario o Contraseña incorrecta' })
  }

})
app.post("/add-usuario", async (req, res) => {
  const { user, usuario_nombre, id_cliente } = req.body;
  let = { password } = req.body;
  let devuelveClave = 0
  try{
    if (!password) {
    password = await generarAleatoria(10)
    devuelveClave = 1
    }
    const validarUsuario = await listUsers({usuario:user,id_cliente})  
    if(validarUsuario.length===0){
      if (!user || !usuario_nombre) {

      } else {
        try {
          await insertarUsuario({ user, password, usuario_nombre, id_cliente })      
          res.json({ password })
        } catch (e) {
          console.log(e)
          res.json({ e })
        }
      }
    }else{
      throw new Error('el usuario '+user+' no se encuentra disponible');      
    }
}catch(e){
  res.status(200).json(e)
  }

})
app.post("/listar-usuario", async (req, res) => {
  let { RUC, token } = req.body;
  try {
    const tokenDec = await decodeToken(token)
    if (!RUC && tokenDec.RUC) {
      RUC = tokenDec.RUC
    }
    //var decoded = jwt.verify(token, 'shhhhh');
    const data = await listUsers({RUC})    
    res.json(data)
  } catch (e) {
    res.status(200).json("no se pudo obtener la informacion")
  }
})
// Inicia el servidor
const port = 3001;
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});