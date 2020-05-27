const bcrypt = require('bcryptjs');
const express = require('express');
const Opcion = require('../models/Opcion');
const Interaccion = require('../models/Interaccion');
const router = express.Router();

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

    if( grupoACD == ""){ grupoACD = null; }

	const opciones = new Opcion(
	{
        conversacion_id : req.body.conversacion_id,
        pais : req.body.pais,
        app : req.body.app,
        fecha : now,
        opcion : req.body.opcion,
        transferencia : req.body.transferencia,
        fueraHorario : req.body.fueraHorario,
        grupoACD : grupoACD
    });    

    const result = await opciones.save()
    res.status(201).send(result);
});

/************************************** Search **************************************/
router.post("/opcion/search", async (req, res)=>{
	console.log('Entro a /opcion/search');
	var pais = req.body.pais;
    var fecha = req.body.fecha.split(" - ");
    var result = {};
    var array_opciones = [];

    var fecha_inicio = moment(new Date(Date.parse(fecha[0])).toISOString()).format("YYYY-MM-DD");
    var fecha_fin =  moment(new Date(Date.parse(fecha[1])).toISOString()).format("YYYY-MM-DD");

    console.log('pais ::', pais, ' :: fecha_inicio :: ', new Date(fecha_inicio), ' :: fecha_fin :: ', new Date(fecha_fin));

    var payload = {
        "fecha": {
            $gte: fecha_inicio, $lte: fecha_fin 
        }, 
        "pais" : pais
    };

    const opcion = await Opcion.find(payload);
    if (opcion.length < 1) return res.status(404).send('No hay datos');

    var dateArray = getDates(fecha_inicio, fecha_fin);
    for (var i = 0; i < dateArray.length; i ++ )
    {
        for (var j = 0; j < opcion.length; j++)
        {                     
            if(opcion[j].fecha.toString() == new Date(dateArray[i]).toString())
            {
                fecha_op = opcion[j].fecha.toISOString().split("T")[0];
                array_opciones.push( fecha_op + ' $$ ' + opcion[j].opcion);    
            }
        }
    }

    array_opciones.forEach(function(numero)
    {
        result[numero] = (result[numero] || 0) + 1;
    });


    /*for(var fech in result)
    {
        var nom = fech.split(" $$ ");
        //console.log(nom[0], " :: ",nom[1], " :: ", result[fech]);
    }*/

    res.status(200).send(result);
});

router.post("/interaccion/search", async (req, res)=>{
    console.log('Entro a /interaccion/search');
    var pais = req.body.pais;
    var fecha = req.body.fecha.split(" - ");
    var result = {};

    var array_interacciones = [];
    var array_trans = [];
    var array_colas = [];
    var array_horario = [];

    var result_inte = {}, result_intes = {};
    var result_tran = {}, result_trans = {};
    var result_cola = {}, result_colas = {};

    var cont_int = 0;

    var fecha_inicio = moment(new Date(Date.parse(fecha[0])).toISOString()).format("YYYY-MM-DD");
    var fecha_fin =  moment(new Date(Date.parse(fecha[1])).toISOString()).format("YYYY-MM-DD");
    var dateArray = getDates(fecha_inicio, fecha_fin);

    console.log('pais ::', pais, ' :: fecha_inicio :: ', new Date(fecha_inicio), ' :: fecha_fin :: ', new Date(fecha_fin));

    var payload_interaccion = {
        "fecha": {
            $gte: fecha_inicio, $lte: fecha_fin 
        }, 
        "pais" : pais
    };

    var payload_transferencia = {
        "fecha": {
            $gte: fecha_inicio, $lte: fecha_fin 
        }, 
        "pais" : pais,
        "transferencia" : true
    };

    /*var payload_horario = {
        "fecha": {
            $gte: fecha_inicio, $lte: fecha_fin 
        }, 
        "pais" : pais,
        "fueraHorario" : fueraHorario
    };*/


    const interaccion = await Interaccion.find(payload_interaccion);
    if (interaccion.length < 1) return res.status(404).send('No hay datos');

    const tranferencias = await Interaccion.find(payload_transferencia);
    if (tranferencias.length < 1) return res.status(404).send('No hay datos');

   

    for (var i = 0; i < dateArray.length; i ++ )
    {
        for (var j = 0; j < interaccion.length; j++)
        {                     
            if(interaccion[j].fecha.toString() == new Date(dateArray[i]).toString())
            {
                fecha_op = interaccion[j].fecha.toISOString().split("T")[0];
                array_interacciones.push( fecha_op + ' $$ ' + interaccion[j].conversacion_id);    
            }
        }

        for (var t = 0; t < tranferencias.length; t++)
        {                     
            if(tranferencias[t].fecha.toString() == new Date(dateArray[i]).toString())
            {
                fecha_trans = tranferencias[t].fecha.toISOString().split("T")[0];
                array_trans.push( fecha_trans + ' $$ '+ t +' $$' + tranferencias[t].transferencia);    
            }
        }
    }

    array_interacciones.forEach(function(numero)
    {
        result_intes[numero] = (result_intes[numero] || 0) + 1;
    });

    array_trans.forEach(function(numero)
    {
        result_trans[numero] = (result_trans[numero] || 0) + 1;
    });   

    for (var i = 0; i < dateArray.length; i ++ )
    {
        for(var str in result_intes)
        {
            var fech = str.split(" $$ ")[0];

            if(fech == dateArray[i])
            {
                cont_int = cont_int + result_intes[str];
                result_inte[dateArray[i]] = cont_int;
            }
            else
            {
                cont_int = 0;
                if(!result_inte.hasOwnProperty(dateArray[i]))
                {
                    result_inte[dateArray[i]] = cont_int;  
                }
                          
            }
        }
    }

    console.log(result_inte);

     console.log(" result_trans :: ", result_trans);

    console.log(" result_trans :: ", result_trans);

    

    res.status(200).send(tranferencias);
});

router.get('/consulta', (req, res) => {
    var respuesta = "Bienvenido a las estadisticas menú Bot, las opciones disponibles son: <br>";
        respuesta += "/opcion/insert: <br> ";
        respuesta += "/interaccion/insert: <br> ";
        respuesta += "/opcion/search: <br> ";
        respuesta += "/interaccion/insert: <br> ";
        respuesta += "Sixbell - Versión: 1.0.0 <br>";

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