var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var interaccionSchema = new Schema({
    conversacion_id: {
        type: Schema.Types.String,
        required: true
    },
    pais:{
        type: Schema.Types.String,
        required: true
    },
    app:{
        type: Schema.Types.String,
        required: true
    },
    fecha:{
        type: Date,
        required: true
    },
    transferencia: {
        type: Schema.Types.String,
        required: true,
        default: false
    },
    fueraHorario: {
        type: Schema.Types.String,
        required: true,
        default: false
    },
    grupoACD:{
        type: Schema.Types.String,
        default: "null"
    }
});

const Interacciones = mongoose.model('Interacciones', interaccionSchema);

module.exports = Interacciones;