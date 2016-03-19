module.exports = function(app, passport){
    var express = require('express'),
        router = express.Router();

    router.get('/', function(req, res){
        if(req.user) return res.redirect(app.get('static_path') + '/index.html');
        res.redirect(app.get('static_path') +'/login.html');
    });

    router.post('/login', function(req, res){
        passport.authenticate('local', function(err, user){
            if(err){ res.redirect(app.get('static_path') +'/login.html'); }
            else{
                if (!user) {
                    res.redirect(app.get('static_path') +'/login.html');
                }else{
                    req.logIn(user, function (err) {
                        if (err) {
                            res.redirect(app.get('static_path') +'/login.html');
                        } else {
                           res.redirect(app.get('static_path') +'/index.html');
                        }
                    });
                }
            }
        })(req, res);
    });

    router.post('/logout', function(req, res){
        if (req.user) {
            req.logout();
        }
        res.redirect(app.get('static_path') +'/login.html');
    });

    return router;
};