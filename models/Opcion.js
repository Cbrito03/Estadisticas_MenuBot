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
	}
});

const Opciones = mongoose.model('Opciones', opcionSchema);

module.exports = Opciones;