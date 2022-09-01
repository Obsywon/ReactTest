/**
 * Define the lists of trusted servers 
 * Allow them to request sensitive data
 */
const whitelist = [
    process.env.URL_FRONTEND,
];

module.exports = whitelist