const userRouter = require("express").Router()
const bcrypt = require("bcrypt")
const User = require("../models/userSchema")
require("../models/blogSchema")

userRouter.post("/", async(req, res) => {
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
    const passwordHash = await bcrypt.hash(req.body.password, 10)
    const user = new User({
        name: req.body.name == undefined ? req.body.username : req.body.name,
        username: req.body.username,
        passwordHash  
    })

    const userJSON = await user.save()
    res.status(201).json(userJSON)
})

userRouter.get("/", async(req, res) => {
    const users = await User.find({}).populate("blogs")
    res.status(200).json(users)
})

module.exports = userRouter
