module.exports = {
    eAdmin: function(req, res, next){
        if(req.isAuthenticated() && req.user && req.user.eAdmin == 1){
            return next()
        } else {
            req.flash("error_msg", "Você precisa ser um Admin")
            res.redirect("/")
        }
    }
}
