module.exports = function(passport, DB){
    var passport = require('passport'),
        LocalStrategy = require('passport-local');

    passport.use(new LocalStrategy(
        {
            usernameField: 'name',
            passwordField: 'password'
        },

        function(username, password, done) {
            DB.User.findOne({name: username, password: password}, function(err, user){
                if(err){ return done(err); }
                //TODO: check password here but modify more
                if(!user){ return done(null, false, {message: 'Incorrect username'}); }
                return done(null, user);
            });
        }
    ));

    passport.serializeUser(function(user, done){
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        DB.User.findById(id, function(err, user) {
            done(err, user);
        });
    });
};