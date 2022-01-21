const jwt = require("jsonwebtoken")
const config = require("../config")
const User = require("../../models/userSchema")

const passwordHandler = (req, res, next) => {
	if(!req.body.password) {
		return res.status(400).json({
			error: "undefined password"
		})
	}
	if(req.body.password && req.body.password.length < 3) {
		return res.status(401).json({
			error: "bad password"
		})
	}
    next()
}

const tokenExtractor = (req, res, next) => {
	const auth = req.get("authorization")
	if(auth && auth.match(/^[bB]earer /)) {
		req.token = auth.substring(7)
	}
	next()
}

const userExtractor = async (req, res, next) => {
    const ver = jwt.verify(req.token, config.SECRET)
    if(!ver.id) {
        next()
    }
    const user = await User.findById(ver.id)
    if(!user) {
        next()
    }
    req.user = user 
    req.body.user = user.id
    next()
}

module.exports = { tokenExtractor, userExtractor, passwordHandler}
