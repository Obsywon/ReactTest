const { UsersModel } = require('../models/userModel');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const { generateAccessToken, generateRefreshToken } = require('../middlewares/Webtoken');


/**
 * Check if an user exists, the password, then send user data + auth token
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const handleLogin = async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(400).json("Veuillez renseigner votre mot de passe et votre e-mail.")
    }
    try {
        let user = await UsersModel.findOne({ email: email }).exec()
        if (!user) {
            return res.status(400).json({
                error: "No user with email '" + email + "' was found."
            })
        }
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json("Mot de passe invalide.")
        }
        const token = generateAccessToken(user);
        const refreshedToken = generateRefreshToken(user);
        try {
            refreshTokenInUserModel(user._id, refreshedToken)
        } catch (err) {
            res.status(500).send('Update failed : ' + err);
        }

        res.cookie('jwt', refreshedToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000, sameSite: 'None', secure: true });
        res.status(200).json({
            accessToken: token,
            name: user.username,
            email: user.email,
            _id: user._id
        });

    } catch (error) {
        res.status(500).json({ error: error })
    }
}

/**
 * Check the request, add user to database or send error
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const handleRegister = async (req, res) => {

    const { username, password, email, passwordConfirmed } = req.body
    if (!username || !email || !password || !passwordConfirmed) {
        return res.status(400).json("Attention, tous les champs sont requis.")
    }
    if (passwordConfirmed !== password) return res.status(400).json("Erreur lors de la confirmation du mot de passe. Veuillez réessayer.")

    try {
        let existingUser = await UsersModel.findOne(
            {
                $or: [
                    { email: email },
                    { username: username }
                ]
            }).select(['-password']).exec()

        if (existingUser) return res.sendStatus(409);
        let hash = await bcrypt.hash(password, saltRounds);
        let user = new UsersModel({
            username: username,
            email: email,
            password: hash,
        })
        user.save()
        res.status(200).json({ user })
    } catch (error) {
        res.status(500).json({ error })
    }
}

/**
 * Log out on the backend side. Operations are needed on the frontside too.
 * @param {*} req 
 * @param {*} res 
 */
const handleLogout = async (req, res) => {
    const cookies = req.cookies
    if (!cookies?.jwt || cookies.jwt === '') return res.status(204); // Pas de contenu à renvoyer mais succès
    const refTok = cookies.jwt;

    let user = await UsersModel.findOne({ refreshToken: refTok }).select('-password').exec()
    // Si le refreshToken n'existe pas, suffit de supprimer le cookie
    if (!user) {
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
        return res.sendStatus(204);
    }

    // Supprimer le token dans la db puis le cookie
    let data = await UsersModel.updateOne({ $unset: { refreshToken: refTok } })
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })

    if (!data) {
        return res.sendStatus(403);
    }
    return res.sendStatus(204);
}

/**
 * Local function to store / update the refresh token for an user
 * @param {*} id 
 * @param {*} token 
 */
const refreshTokenInUserModel = async (id, token) => {
    const updateUser = {
        refreshToken: token,
    };

    let user = await UsersModel.findByIdAndUpdate(
        id,
        { $set: updateUser },
        { new: true }).select(["-password"]).exec();
}

module.exports = {
    handleRegister,
    handleLogin,
    handleLogout,
};