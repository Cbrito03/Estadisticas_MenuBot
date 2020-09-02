var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var opcionSchema = new Schema({
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
	opcion: {
		type: Schema.Types.String,
		required: true
	},
    rrss: {
        type: Schema.Types.String,
        required: false
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

const Opciones = mongoose.model('Opciones', opcionSchema);

module.exports = Opciones;