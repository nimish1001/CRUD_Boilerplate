const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true
        },
        username: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true,
            minlength: 8
        },
        tokens: [{
            token:{
                type: String,
                required: true
            }
        }]
}, {
    timestamps: true
});

userSchema.statics.findByCredentials = async(username, password) => {
    const user = await User.findOne({username});
    if(!user){
        throw new Error('No user found');
    }

    const isCorrect = await bcrypt.compare(password, user.password);
    if(!isCorrect){
        throw new Error('Incorrect password');
    }

    return user;
}

userSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    return userObject;
}

userSchema.methods.getAuthToken = async function () {
    const user = this;
    const token = jwt.sign({_id: user._id.toString()}, 'tempToken');

    user.tokens = user.tokens.concat({token});
    await user.save();
    return token;
}

userSchema.pre('save', async function(next) {
    const user = this;
        if(user.isModified('password')){
            user.password = await bcrypt.hash(user.password, 8);
        }
        next();
});

const User = mongoose.model('User', userSchema);


module.exports = User;