const {Schema, model} = require('mongoose');

const schema = new Schema({
    ip: {type: String, required: true},
    continent: {type: String, required: true},
    country: {type: String, required: true},
    city: {type: String, required: true},
    view: {type: Number, default: 1},
    date: {type: Date, default: Date.now},
    source: {type: String, default: null},
    campaign: {type: String, default: null}

});

module.exports = model('CollectedData', schema);