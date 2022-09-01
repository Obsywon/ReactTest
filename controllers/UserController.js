const { ObjectID } = require('bson');
const { UsersModel } = require('../models/userModel');
const bcrypt = require('bcrypt');
const saltRounds = 10;

/**
 * Send 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const getAllUsers = async (req, res) => {
    try {
        let users = await UsersModel.find().select(["-password", "-accessToken"]).exec();
        res.send(users);
    } catch (err) {
        return res.status(500).send('Error : data unavailable - ' + err)
    }
}


const getUserById = async (req, res) => {
    if (!ObjectID.isValid(req.params.id)) {
        return res.status(400).send("Unknown ID : " + req.params.id)
    }
    try {
        let user = await UsersModel.findById(req.params.id).select(["-password"]).exec();
        res.send(user)
    } catch (err) {
        res.status(400).send('User not found: ' + err);
    }
};


const updateUserByid = async (req, res) => {
    if (!ObjectID.isValid(req.params.id)) {
        return res.status(400).send("Unknown ID : " + req.params.id)
    }
    try {
        let hash = await bcrypt.hash(req.body.password, saltRounds);

        const updateUser = {
            username: req.body.username,
            email: req.body.email,
            password: hash,
        };

        let user = await UsersModel.findByIdAndUpdate(
            req.params.id,
            { $set: updateUser },
            { new: true }).select(["-password"]).exec();
        res.send(user)
    } catch (err) {
        res.status(500).send('Update failed : ' + err);
    }
}


const deleteUserById = async (req, res) => {
    if (!ObjectID.isValid(req.params.id)) {
        return res.status(400).send("Unknown ID : " + req.params.id)
    }
    try {
        let deleted = await UsersModel.findByIdAndDelete(req.params.id);
        res.send({
            hasBeenDeleted: true
        })
    } catch (err) {
        res.status(500).send("Unknown ID : " + req.params.id)
    }
};


module.exports = {
    getUserById,
    deleteUserById,
    updateUserByid,
    getAllUsers
};