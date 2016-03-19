process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

var express = require('express'),
    session = require('express-session'),
    SessionStore = require('sessionstore'),
    methodOverride = require('method-override'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    util = require('util'),
    passport = require('passport'),
    morgan = require('morgan'),
    config = require('./config');

var isProduction = process.env.NODE_ENV == 'pro';
var config_env = isProduction ? config.pro : config.dev;
var DB = require('./models')(config_env);
var logger = morgan('dev');
var static_path = '/app';
var app = express();
app.set('env', process.env.NODE_ENV);
app.set('static_path', static_path);
app.isProduction = isProduction;
app.use(methodOverride('X-HTTP-Method-Override'));

if(!app.isProduction){app.use('/app', express.static('./static/app'));}
else{app.use('/dist', express.static('./static/dist'));}
app.use('/assets', express.static('./static/assets'));
app.use('/vendor', express.static('./static/vendor'));

app.use(bodyParser.json({limit: '200mb'}));
app.use(bodyParser.urlencoded({limit: '200mb', extended: true}));
app.use(cookieParser());
app.use(logger);

var session_store = SessionStore.createSessionStore();
app.use(session({
    store: session_store,
    secret: 'ZoKaVn',
    key: 'sessionId',
    cookie: {
        maxAge: config.session.cookie.max_age * 1000 // 5 * 24h,
        //, httpOnly: true
    },
    resave: true,
    saveUninitialized: true
}));

require('./modules/passport')(passport, DB);
app.use(passport.initialize());
app.use(passport.session());

/* Routes */
app.use('/', require('./routers/index')(app, passport));

/* Error handler */
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

if (!app.isProduction) {
    app.use(function(err, req, res, next) {
        res.status(err.code || 500).json({ code: err.code || err.status || 500, message: err.message, ecode: err.ecode });
    });
}

app.use(function(err, req, res, next) {
    if(err.code == 403) {
        res.status(403).send("Opps! Unauthenticated!");
    } else {
        res.status(err.status || 500).json(err);
    }
});

/* Run server */
app.listen(config_env.server.port, '0.0.0.0', function() {
    console.log('Express server listening on port %s', config_env.server.port);
});