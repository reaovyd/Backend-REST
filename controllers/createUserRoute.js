const userRouter = require("express").Router()
const bcrypt = require("bcrypt")
const User = require("../models/userSchema")
const passwordHandler = require("../utils/middleware/loginMiddleware").passwordHandler
require("../models/blogSchema")

userRouter.post("/", passwordHandler, async(req, res) => {
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
	const users = await User.find({}).populate("blogs", { title: 1, author: 1, url: 1, likes: 1, id: 1})
	res.status(200).json(users)
})

module.exports = userRouter
