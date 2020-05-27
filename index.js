const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const app = express();
const morgan = require('morgan');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
var fs = require('fs');

var buffer = require('fs').readFileSync("cert/cert.pem");

dotenv.config();

const estadistica = require('./routes/estadistica');

app.use(cors());
app.use(morgan('tiny'));
app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(estadistica);

const port = process.env.PORT || 8080;

app.listen(port, app, async () => { // Revisa si el mismo esta vivo
    console.log("[Brito] :: API escuchando en puerto", port);

    console.log('[Brito] :: Conectando a MongoDb...');

    await mongoose.connect('mongodb://ibm_cloud_e7aefbf8_0f75_4fb4_b2d4_eac085a84ad9:5e5df1276392b439147cd7c215a9001161775ef946d17d7cce42b69464727025@617dc8cb-c565-4f72-b956-09be96d3233b-0.blijs0dd0dcr4f55oehg.databases.appdomain.cloud:32112,617dc8cb-c565-4f72-b956-09be96d3233b-1.blijs0dd0dcr4f55oehg.databases.appdomain.cloud:32112/ibmclouddb?authSource=admin&replicaSet=replset',
    {
        tls: true,    
        tlsCAFile: "cert/cert.pem",
        useUnifiedTopology: true ,
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        useCreateIndex: true
    })
    .then(() => console.log('Conexión establecida a MongoDb'))
    .catch(error => {
        console.log('[Brito] :: No se ha logrado conectar a MongoDb :\n', error)
        console.log('[Brito] :: Deteniendo API...')
        process.exit(1)
    });
});