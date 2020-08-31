const bcrypt = require('bcryptjs');
const express = require('express');
const Opcion = require('../models/Opcion');
const Usuario = require('../models/Usuario');
const Pais = require('../models/Pais');
const Window = require('window');
const router = express.Router();

const window = new Window();

var BCRYPT_SALT_ROUNDS = 12;

const { check, validationResult } = require('express-validator');

var moment = require('moment');
var moment_timezone = require('moment-timezone');

const { UV_FS_O_FILEMAP } = require('constants');

/************************************** Insert´s **************************************/
router.post("/opcion/insert", async (req, res)=>{
    var now = moment();
    now = now.tz("America/Guatemala").format("YYYY-MM-DD");
    console.log('Entro a /opcion/insert :: ', now);

    var grupoACD = req.body.grupoACD;
    var rrss = req.body.rrss;

    switch (rrss)
    {
        case 'FB':
            rrss = "Facebook"
        break;
        case 'TW':
            rrss = "Twitter"
        break;
        case 'WA':
            rrss = "WhatsApp"
        break;       
    }

    if( grupoACD == ""){ grupoACD = null; }

	const opciones = new Opcion(
	{
        conversacion_id : req.body.conversacion_id,
        pais : req.body.pais,
        app : req.body.app,
        rrss : rrss,
        fecha : now,
        opcion : req.body.opcion,
        transferencia : req.body.transferencia,
        fueraHorario : req.body.fueraHorario,
        grupoACD : grupoACD
    });    

    const result = await opciones.save()
    res.status(201).send(result);
});

router.post("/usuario/insert", async (req, res)=>{
    
    console.log('Entro a /usuario/insert :: ');
    
    const password = bcrypt.hashSync(req.body.password, BCRYPT_SALT_ROUNDS);

    const usuarios = new Usuario(
    {
        usuario : req.body.usuario,
        password : password,
        nombre : req.body.nombre,
        perfil : req.body.perfil
    });

    console.log(usuarios);    

    const result = await usuarios.save()
    res.status(201).send(result);
});

router.post("/pais/insert", async (req, res)=>{
    
    console.log('Entro a /pais/insert :: ');

    const paises = new Pais(
    {
        pais_id : req.body.pais_id,
        pais : req.body.pais
    });

    console.log(paises);    

    const result = await paises.save()
    res.status(201).send(result);
});

/************************************** Search **************************************/
router.post("/usuario/login", async (req, res)=>{
    console.log('Entro a /usuario/login');
    
    var payload = { "usuario": req.body.usuario };

    const usuario = await Usuario.find(payload);
    if (usuario.length < 1) return res.status(200).send('NOK');

    if (!bcrypt.compareSync(req.body.password, usuario[0].password)) return res.status(200).send('NOK contraseña');

    const result = {
        "nombre" : usuario[0].nombre,
        "perfil" : usuario[0].perfil,
        "status" : usuario[0].status
    }
    
    res.status(200).send(result);
});

router.post("/opcion/searchOp", async (req, res)=>{
	console.log('Entro a /opcion/searchOp');
	var pais = req.body.pais;
    var rrss = req.body.rrss;
    var fecha = req.body.fecha.split(" - ");
    var result = {};
    var array_opciones = [];

    var array_fecha = [];
    var obj = {};

    var fecha_inicio = moment(new Date(Date.parse(fecha[0])).toISOString()).format("YYYY-MM-DD");
    var fecha_fin =  moment(new Date(Date.parse(fecha[1])).toISOString()).format("YYYY-MM-DD");

    console.log('pais ::', pais, ' :: fecha_inicio :: ', new Date(fecha_inicio), ' :: fecha_fin :: ', new Date(fecha_fin));

    var payload = {
        "fecha": {
            $gte: fecha_inicio, $lte: fecha_fin 
        }, 
        "pais" : pais
    };

    if(rrss !== "General")
    {
        payload.rrss = rrss;
    }
    console.log("[playload] :: ", payload);
   

    const opcion = await Opcion.find(payload);
    if (opcion.length < 1) return res.status(200).send('NOK');

    var dateArray = getDates(fecha_inicio, fecha_fin);
    for (var i = 0; i < dateArray.length; i ++ )
    {
        for (var j = 0; j < opcion.length; j++)
        {                     
            if(opcion[j].fecha.toString() == new Date(dateArray[i]).toString())
            {
                fecha_op = opcion[j].fecha.toISOString().split("T")[0];
                array_opciones.push( fecha_op + ' $$ ' + opcion[j].opcion.replace(/ - /g, "-"));    
            }
        }
    }

    array_opciones.forEach(function(numero)
    {
        var dato_fecha =  numero.split(" $$ ")[0];
        result[numero] = (result[numero] || 0) + 1;
    });

    const window = new Window();

    for(var f in result)
    {
        var fecha = f.split(" $$ ")[0];
        var opciones = f.split(" $$ ")[1];
        var cantidad = result[f];

        if(array_fecha.includes(fecha))
        {
            Object.defineProperty(window["obj_"+fecha], opciones , {value: cantidad,enumerable: true});
        }
        else
        {
            array_fecha.push(fecha);
            window["obj_"+fecha] = {};
            Object.defineProperty(window["obj_"+fecha], opciones , {value: cantidad,enumerable: true});
        }
    }

    for(var i = 0; i < array_fecha.length; i++)
    {
        obj[array_fecha[i]] = window["obj_"+array_fecha[i]];
    }

    res.status(200).send(obj);
});

router.post("/opcion/searchIn", async (req, res)=>{
    console.log('Entro a /interaccion/searchIn');
    var pais = req.body.pais, fecha = req.body.fecha.split(" - ");
    var rrss = req.body.rrss;
    var result = {};

    var array_interacciones = [];
    var array_transferencias = [];
    var array_fueraHorario = [];

    var result_inte = {}, result_interacciones = {};
    var result_tran = {}; result_transacciones = {}
    var result_horario = {}, result_fueraHorario = {};

    var array_fecha = [];
    var obj = {};

    var cont_int = 0;

    var fecha_inicio = moment(new Date(Date.parse(fecha[0])).toISOString()).format("YYYY-MM-DD");
    var fecha_fin =  moment(new Date(Date.parse(fecha[1])).toISOString()).format("YYYY-MM-DD");
    var dateArray = getDates(fecha_inicio, fecha_fin);

    console.log('pais ::', pais, ' :: fecha_inicio :: ', fecha_inicio, ' :: fecha_fin :: ', new Date(fecha_fin));

    var payload_interaccion = {
        "fecha": {
            $gte: fecha_inicio, $lte: fecha_fin 
        }, 
        "pais" : pais
    };


    if(rrss !== "General")
    {
        payload_interaccion.rrss = rrss;
    }

    console.log("[playload] :: ", payload_interaccion);

    const interaccion = await Opcion.find(payload_interaccion);
    if (interaccion.length < 1) return res.status(200).send('NOK');    

    for (var i = 0; i < dateArray.length; i ++ )
    {
        for (var j = 0; j < interaccion.length; j++)
        {                     
            if(interaccion[j].fecha.toString() == new Date(dateArray[i]).toString())
            {
                var fecha_op = interaccion[j].fecha.toISOString().split("T")[0];

                array_interacciones.push( fecha_op + ' $$ ' + interaccion[j].conversacion_id);
                
                if(interaccion[j].transferencia === "true")
                {
                    array_transferencias.push( fecha_op + ' $$ ' + interaccion[j].grupoACD);   
                }
                else if(interaccion[j].fueraHorario === "true")
                {
                    array_fueraHorario.push( fecha_op );
                }  
            }
        }
    }

    array_interacciones.forEach(function(numero)
    {
        result_inte[numero] = (result_inte[numero] || 0) + 1;
    });

    array_transferencias.forEach(function(numero)
    {
        result_tran[numero] = (result_tran[numero] || 0) + 1;
    });

    array_fueraHorario.forEach(function(numero)
    {
        result_horario[numero] = (result_horario[numero] || 0) + 1;
    });

    for (var i = 0; i < dateArray.length; i ++ )
    {
        for(var str in result_inte)
        {
            var fech = str.split(" $$ ")[0];

            if(fech == dateArray[i])
            {
                cont_int = cont_int + result_inte[str];
                result_interacciones[dateArray[i]] = cont_int;
            }
            else
            {
                cont_int = 0;
                if(!result_interacciones.hasOwnProperty(dateArray[i]))
                {
                    result_interacciones[dateArray[i]] = cont_int;  
                }
                          
            }
        }
    }

     for(var f in result_tran)
    {
        var fecha = f.split(" $$ ")[0];
        var acdColas = f.split(" $$ ")[1];
        var cantidad = result_tran[f];

        //console.log("result_tran",fecha,acdColas,cantidad);

        if(array_fecha.includes(fecha))
        {
            Object.defineProperty(window["obj_"+fecha], acdColas , {value: cantidad,enumerable: true});
        }
        else
        {
            array_fecha.push(fecha);
            window["obj_"+fecha] = {};
            Object.defineProperty(window["obj_"+fecha], acdColas , {value: cantidad,enumerable: true});
        }
    }

    for(var i = 0; i < array_fecha.length; i++)
    {
        obj[array_fecha[i]] = window["obj_"+array_fecha[i]];
    }

    var resultado = {
        "interacciones" : result_interacciones,
        "transferencias" : obj,
        "fueraHorario" : result_horario
    }

    //console.log(resultado);

    res.status(200).send(resultado);
});

router.get("/pais/search", async (req, res)=>{
    console.log('Entro a /pais/search');

    const pais = await Pais.find();
    if (pais.length < 1) return res.status(200).send('NOK');
    
    res.status(200).send(pais);
});

router.get('/consulta', (req, res) => {
    var respuesta = "Bienvenido a las estadisticas menú Bot, las opciones disponibles son: <br>";
        respuesta += "/opcion/insert: <br> ";
        respuesta += "/opcion/searchIn: <br> ";
        respuesta += "/opcion/searchOp: <br> ";
        respuesta += "/usuario/insert: <br> ";
        respuesta += "/usuario/login: <br> ";
        respuesta += "Sixbell - Versión: 4.0.0 <br>";

    console.log("[Brito] :: " + respuesta);

    res.status(200).send(respuesta);
});

function getDates(startDate, stopDate)
{
    var dateArray = [];
    var currentDate = moment(startDate);
    var stopDate = moment(stopDate);
    while (currentDate <= stopDate) {
        dateArray.push( moment(currentDate).format('YYYY-MM-DD') )
        currentDate = moment(currentDate).add(1, 'days');
    }
    return dateArray;
}   

module.exports = router