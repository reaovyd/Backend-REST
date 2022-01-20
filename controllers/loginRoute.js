const bcrypt = require("bcrypt") 
const User = require("../models/userSchema")
const jwt = require("jsonwebtoken")
const loginRouter = require("express").Router()

loginRouter.post("/", async(req, res) => {
    const user = await User.find({username: req.body.name })
})

module.exports = loginRouter
