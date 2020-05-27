const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const app = express();
const morgan = require('morgan');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

dotenv.config();

const estadistica = require('./routes/estadistica');

app.use(cors());
app.use(morgan('tiny'));
app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(estadistica);

const port = process.env.PORT || 8080;

app.listen(port, app, async () => { // Revisa si el mismo esta vivo
    console.log("API escuchando en puerto", port);

    console.log('Conectando a MongoDb...');
    //console.log('URL: mongodb://localhost/estadisticaMenuBot');
    //console.log('URL: mongodb://dbaas30.hyperp-dbaas.cloud.ibm.com:28255,dbaas29.hyperp-dbaas.cloud.ibm.com:28214,dbaas31.hyperp-dbaas.cloud.ibm.com:28036/admin?replicaSet=estadisticaMenuBot');
    console.log('URL: mongodb://'.concat(process.env.URL_MONGODB).concat('/testing_abastible'))

    await mongoose.connect('mongodb://$USERNAME:$PASSWORD@617dc8cb-c565-4f72-b956-09be96d3233b-0.blijs0dd0dcr4f55oehg.databases.appdomain.cloud:32112,617dc8cb-c565-4f72-b956-09be96d3233b-1.blijs0dd0dcr4f55oehg.databases.appdomain.cloud:32112/ibmclouddb?authSource=admin&replicaSet=replset',
    {
        user: 'ibm_cloud_0704e43b_5a90_46e8_a3f6_51248478ada4',
        pass: '"b2ba3198f486abd8115e2b404282ff52749c090a1a8b7c4135d3f6e85581f78e',
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        useCreateIndex: true
    })
    .then(() => console.log('Conexión establecida a MongoDb'))
    .catch(error => {
        console.log('No se ha logrado conectar a MongoDb :\n', error)
        console.log('Deteniendo API...')
        process.exit(1)
    });
});