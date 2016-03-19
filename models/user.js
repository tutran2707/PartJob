module.exports = function(mongoose){
    var Schema = mongoose.Schema;

    var userSchema = new Schema({
        name: { type: String, required: true, unique: true },
        password: { type: String, require: true },
        created_at: Date,
        updated_at: Date
    });

    return { User: mongoose.model('User', userSchema) }
};