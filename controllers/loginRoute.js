const bcrypt = require("bcrypt") 
const User = require("../models/userSchema")
const jwt = require("jsonwebtoken")
const loginRouter = require("express").Router()

loginRouter.post("/", async(req, res) => {
})

module.exports = loginRouter
