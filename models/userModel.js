const mongoose = require('mongoose');

const UsersModel = mongoose.model(
    "altern",
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            default: Date.now()
        },
        refreshToken: {
            type: String
        }

    },
    "users"
)

module.exports = {UsersModel};