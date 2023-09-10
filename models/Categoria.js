const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categoriaSchema = new mongoose.Schema({
    nome: String,
    slug: String,
    date: {
        type: Date,
        default: Date.now
    }
});

const Categoria = mongoose.model('categorias', categoriaSchema);
module.exports = Categoria;
