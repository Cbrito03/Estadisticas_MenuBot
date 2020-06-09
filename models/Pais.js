var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var paisSchema = new Schema({
    pais_id: {
        type: Schema.Types.String,
        required: true
    },
    pais:{
        type: Schema.Types.String,
        required: true
    },
    status: {
        type: Schema.Types.Boolean,
        required: true,
        default: true
    }
});

const Paises = mongoose.model('Paises', paisSchema);

module.exports = Paises;