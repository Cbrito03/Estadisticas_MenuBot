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
    console.log('URL: mongodb://dbaas30.hyperp-dbaas.cloud.ibm.com:28255/admin?replicaSet=estadisticaMenuBot');

    /*await mongoose.connect(' mongodb://dbaas30.hyperp-dbaas.cloud.ibm.com:28255/estadisticaMenuBot',
    {
        user: 'sixbell_menuBot',
        pass: 'S1xb3ll_MenuBot_2o2o',
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
    })*/

   
});