var mongoose = require('mongoose'),
    fs = require('fs'),
    lodash = require('lodash'),
    db = {};

module.exports = function(config){

    var options = { server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
        replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } } };
    mongoose.connect(config.dbUri, options);

    var conn = mongoose.connection;
    conn.on('error', console.error.bind(console, 'connection error:'));

    conn.once('open', function() {
        console.log("Connect DB success");
    });

    var models = fs.readdirSync(__dirname);
    models.forEach(function (file) {
        if(file != 'index.js'){
            var model = require('./' + file)(mongoose);
            db = lodash.extend(model, db);
        }
    });

    return db;
};