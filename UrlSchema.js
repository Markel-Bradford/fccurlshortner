const mongoose = require('mongoose')

const urlSchema = new mongoose.Schema({
    original_url: String,
    short_url: {
        type: Number,
    required: true,
    unique: true, // Ensure unique short_url values
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not a valid short_url.'
    }
    }
})

module.exports = mongoose.model('Url', urlSchema)
