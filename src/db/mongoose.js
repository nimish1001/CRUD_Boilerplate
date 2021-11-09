const mongoose = require("mongoose");

mongoose.connect('mongodb://127.0.0.1:27017/crud_biolerplate', {
    useNewUrlParser: true,
    useCreateIndex: true
});