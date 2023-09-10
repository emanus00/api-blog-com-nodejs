const express = require('express');
const path = require('path')
const router = express.Router()
const mongoose = require('mongoose')
require("../models/Categoria")
const Categoria = mongoose.model("categorias")
require("../models/Postagem")
const Postagem = mongoose.model("postagens")
const {eAdmin} = require("../helpers/eAdmin")

// Middleware para tratar solicitações POST
router.use(express.urlencoded({ extended: true }));
router.use(express.json());


router.get("/categorias", eAdmin, (req, res) => {
    Categoria.find({ nome: { $exists: true, $ne: "" }, slug: { $exists: true, $ne: "" } }).lean()
        .then((categorias) => {
            res.render("admin/categorias", ({categorias:categorias}));
        })
        .catch((err) => {
            req.flash("error_msg", "Erro ao listar categorias");
            res.redirect("/admin");
        });
});

router.get("/categorias/add", eAdmin, (req,res) => {
    res.render("admin/addcategoria")
})

router.post("/categorias/new", eAdmin, (req,res) => {

    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome Inválido"})
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug Inválido"})
    }
    if(req.body.nome.length < 4){
        erros.push({texto: "Nome da categoria é muito pequeno"})
    } 
    if(erros.length > 0){
        res.render("../views/admin/addcategoria", {erros: erros})
    }else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria criada com sucesso!")
            res.redirect("/admin/categorias")
        }).catch((err) => {
            req.flash("error_msg", "Erro ao criar categoria!")
        });
    }

})   

router.get("/categorias/edit/:id",  eAdmin, (req,res) => {
    Categoria.findOne({_id:req.params.id}).lean().then((categoria)=>{
        res.render('admin/editcategoria', {categoria:categoria})
    }).catch((err) => {
        req.flash("error_msg", "Esta categoria não existe!")
        res.redirect("/admin/categorias")
    })
})

router.post("/categorias/edit", eAdmin, (req,res) => {

    Categoria.findOne({_id: req.body.id}).then((categoria) => {

    categoria.nome = req.body.nome,
    categoria.slug = req.body.slug

    categoria.save().then(() => {
        req.flash("success_msg", "Categoria editada com Sucesso!")
        res.redirect("/admin/categorias")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno ao editar categoria")
        res.redirect("/admin/categorias")
    })

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar categoria")
        res.redirect("/admin/categorias")
        console.log(err)
    })

})

router.post("/categorias/deletar", eAdmin,  (req, res) => {
    Categoria.deleteOne({ _id: req.body.id })
        .then(() => {
            req.flash("success_msg", "Categoria deletada com sucesso!");
            res.redirect("/admin/categorias");
        })
        .catch((err) => {
            req.flash("error_msg", "Erro ao deletar categoria.");
            res.redirect("/admin/categorias");
        });
});

router.get("/postagens", eAdmin,  (req,res) => {

    Postagem.find().populate("categoria").lean().sort({data: "desc"}).then((postagens) => {
        res.render("admin/postagens", {postagens: postagens})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as postagens")
        res.redirect("/admin")
    })
})

router.get("/postagens/add", eAdmin, (req,res) => {
    Categoria.find({ nome: { $exists: true, $ne: "" }, slug: { $exists: true, $ne: "" } }).lean()
    .then((categorias) => {
        res.render("admin/addpostagens", {categorias: categorias})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário.")
        res.redirect("/admin")
    })
})

router.post("/postagens/new", eAdmin, (req,res) => {
    
    var erros = []

    if(req.body.categoria == "0"){
        erros.push({text: "Categoria inválida, registre uma categoria"})
    }
    if(erros.length > 0){
        res.render("admin/addpostagens", {erros: erros})
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }
    
        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem criada com sucesso")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            console.log(err.message);
            req.flash("error_msg", "Houve um erro ao criar postagem")
            res.redirect("/admin/postagens")
        })

        
    }

})

router.get("/postagens/edit/:id",  eAdmin, (req, res) => {
    Postagem.findOne({ _id: req.params.id }).lean().then((postagem) => {
        Categoria.find({ nome: { $ne: '' } }).lean().then((categorias) => {
            res.render("admin/editpostagem", { categorias: categorias, postagem: postagem });
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar as categorias!");
            res.redirect("/admin/postagens");
        });
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário de edição");
        res.redirect("/admin/postagens");
    });
});

router.post("/postagem/edit", eAdmin, (req,res) => {
    Postagem.findOne({_id: req.body.id}).then((postagem) => {

        postagem.titulo = req.body.titulo,
        postagem.slug = req.body.slug,
        postagem.descricao = req.body.descricao,
        postagem.conteudo = req.body.conteudo,
        postagem.categoria = req.body.categoria

        postagem.save().then(() => {
            req.flash("success_msg", "Postagem editada com Sucesso!")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            console.log(err)
            req.flash("error_msg", "Houve um erro interno ao editar o post")
            res.redirect("/admin/postagens")
        })

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao salvar edição")
        res.redirect("/admin/postagens")
    })
})

router.post("/postagens/deletar", eAdmin,  (req, res) => {
    Postagem.deleteOne({ _id: req.body.id })
        .then(() => {
            req.flash("success_msg", "Categoria deletada com sucesso!");
            res.redirect("/admin/postagens");
        })
        .catch((err) => {
            req.flash("error_msg", "Erro ao deletar categoria.");
            res.redirect("/admin/postagens");
        });
});

module.exports = router;
