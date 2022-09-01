const whitelist = require('./whitelistedOrigins');

/**
 * Define the CORS strategy
 */
const corsOpt = {
    origin: (origin, cb)=>{
        if (whitelist.indexOf(origin) !== -1 || !origin){
            cb(null, true)
        }else{
            cb(new Error("CORS : access refused."))
        }
    },
    optionsSuccessStatus: 200
}

module.exports = corsOpt