const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const usuarioSchema = new mongoose.Schema({
    nome:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    eAdmin: {
        type: Number,
        default: 0
    },
    senha:{
        type: String,
        required: true
    }  

})

mongoose.model('usuarioSchema', usuarioSchema)