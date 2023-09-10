const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const handlebars = require("express-handlebars").create({
    defaultLayout: "main",
});
const routes = require("./routes/admin");
const { default: mongoose } = require('mongoose');
const session = require('express-session')
const flash = require('connect-flash');
const Categoria = require('./models/Categoria');
require("./models/Postagem")
const Postagem = mongoose.model("postagens")
const usuarios = require("./routes/usuario");
const router = require('./routes/usuario');
const passport = require("passport")
require("./config/auth")(passport)
const {eAdmin} = require("./helpers/eAdmin")

// Configurações
    //Sessão
    app.use(session({
        secret: "cursodenode",
        resave: true,
        saveUninitialized: true
    }))
    app.use(passport.initialize())
    app.use(passport.session())
    app.use(flash());
    //Middleware
    app.use((req, res, next) => {
        res.locals.success_msg = req.flash("success_msg")
        res.locals.error_msg = req.flash("error_msg")
        res.locals.error = req.flash("error")
        res.locals.user = req.user || null
        next()
    })
    
//Bodyparser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
    
//Handlebars
app.engine("handlebars", handlebars.engine);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

//Mongoose

mongoose.Promise = global.Promise
mongoose.connect("mongodb://127.0.0.1/blogapp").then(() => {
    console.log("Conectado ao banco com sucesso!")
}).catch((err) => {
    console.log("Erro ao se conectar com o banco de dados " + err)
})
    //Public
app.use(express.static(path.join(__dirname, "public")));

// Rotas

app.get('/', (req, res) => {
    Postagem.find().populate("categoria").lean().sort({data: "desc"}).then((postagens) => {
        res.render("index", {postagens: postagens})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as postagens")
        res.redirect("/404")
    })
});
app.get('/postagem/:slug',  eAdmin, (req,res) => {
    const slug = req.params.slug
    Postagem.findOne({slug})
        .then(postagem => {
            if(postagem){
                const post = {
                    titulo: postagem.titulo,
                    data: postagem.data,
                    conteudo: postagem.conteudo
                }
                res.render('postagem/index', post)
            }else{
                req.flash("error_msg", "Essa postagem nao existe")
                res.redirect("/")
            }
        })
        .catch(err => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
})

app.get("/404", (req,res) => {
    res.send("Error 404!")
})

app.get('/posts', (req, res) => {
    res.send("Lista de posts");
});

app.get("/categorias",  eAdmin, (req,res) =>{
    Categoria.find().lean().then((categoria) => {
        res.render("categorias/index", {categoria: categoria})
    }).catch((err) => {
        console.log(err)
        req.flash("error_msg", "Houve um erro ao listar as categorias")
        res.redirect("/")
    })
})


app.get("/categorias/:slug",  eAdmin, (req,res, next) => {
    Categoria.findOne({slug: req.params.slug}).lean().then((categoria) => {
        
        if(categoria){
            Postagem.find({categoria: categoria._id}).lean().then((postagens) => {
                res.render("categorias/postagens", {postagens: postagens})

            }).catch((err) => {
                req.flash("error_msg", "Houve um erro ao listar os posts")
            })
        }else{
            req.flash("error_msg", "Esta categoria não existe")
            res.redirect("/")
        }

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno ao carregar a página desta categoria!")
        res.redirect("/")
    })
})


app.get('/postagens', eAdmin, (req, res, next) => {
    Postagem.find().lean()
      .then((postagens) => {
        res.render('postagem/postagens', { postagens: postagens });
      })
      .catch((err) => {
        req.flash('error_msg', 'Houve um erro ao listar as postagens');
        res.redirect('/');
      });
  });




app.use("/admin", routes);
app.use("/usuarios", router)
// Inicialização do servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log("Servidor rodando na porta ${PORT}");
});

