const jwt = require('jsonwebtoken');
const { UsersModel } = require('../models/userModel');


/**
 * Generate an access token, to be held in the state of the app (client side)
 * @param {*} user 
 * @returns 
 */
const generateAccessToken = (user) => {
    const { username } = user;
    return jwt.sign(
        { username: username },
        process.env.SECRET_TOKEN,
        { expiresIn: '300s' });
}

/**
 * Generate a longlasting refresh token, to be stored in database
 * and sent as a cookie
 * @param {*} user 
 * @returns 
 */
const generateRefreshToken = (user) => {
    const { username } = user;
    
    return jwt.sign(
        { username: username },
        process.env.REFRESH_TOKEN,
        { expiresIn: '1d' });
}


/**
 * Middleware to verify the auth token in a request
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
const verify = (req, res, next) => {
    let token = undefined
    if (req.headers.authorization){
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ error: "Please provide a token" })
    jwt.verify(token, process.env.SECRET_TOKEN, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Failed to authenticate token' });
        req.user = decoded.username;
        next();
    });

}


/**
 * Refresh the token based on the refresh token stored
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const refreshToken = async (req, res) => {
    const cookies = req.cookies
    if (!cookies?.jwt) return res.status(401);

    const refToken = cookies.jwt;

    let user = await UsersModel.findOne({ refreshToken: refToken }).select('-password').exec()
    if (!user) return res.sendStatus(403);

    jwt.verify(
        refToken,
        process.env.REFRESH_TOKEN,
        (err, decoded) => {
            if (err || user.username !== decoded.username) return res.sendStatus(403);
            const accessToken = generateAccessToken(user)
            res.json({
                accessToken: accessToken,
                name: user.username,
                email: user.email,
                _id: user._id
            });

        }
    )

}




module.exports = {
    refreshToken,
    generateAccessToken,
    verify,
    generateRefreshToken
}