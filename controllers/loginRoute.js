const bcrypt = require("bcrypt") 
const User = require("../models/userSchema")
const jwt = require("jsonwebtoken")
const loginRouter = require("express").Router()

loginRouter.post("/", async(req, res) => {
    const user = await User.find({username: req.body.username })
    const passwordVerify = (user === null || user === undefined) ? false : await bcrypt.compare(req.body.password, user.passwordHash) 
    if(!(user && passwordVerify)) {
        return res.status(401).json({
            error: "invalid login"
        })
    }

    //const newUserToken = {
    //    username: user.username,
    //    name: user.name,
    //    id: user._id
    //}

    //const token = jwt.sign(newUserToken, process.env.SECRET)
    //res.status(201).json({
    //    token
    //})
})

module.exports = loginRouter
