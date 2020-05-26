'use strict';
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/estadisticaMenuBot');

module.exports = mongoose;