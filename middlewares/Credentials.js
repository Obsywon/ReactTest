const whitelist = require('../configs/whitelistedOrigins.js')


/**
 * Middleware to add headers if website is in trusted list
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const credentials = (req, res, next) =>{
    const origin = req.headers.origin
    if (whitelist.includes(origin)){
        res.header('Access-Control-Allow-Credentials', true);
    }
    next()
}

module.exports = credentials