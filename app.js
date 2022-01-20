const cors = require("cors") 
const express = require("express")
const app = express()
const morgan = require("morgan")
const mongoose = require("mongoose")
require("express-async-errors")
const config = require("./utils/config")
const logger = require("./utils/logger")
const errorMiddleware = require("./utils/middleware/errorMiddleware")
const createUserRoute = require("./controllers/createUserRoute")
const loginRouter = require("./controllers/loginRoute")

logger.info("Connecting to MongoDB")

mongoose.connect(config.MONGODB_URI).then(res => {
    logger.info("Connected to MongoDB") 
}).catch(err => {
    logger.error("Failed to connect MongoDB", err.message)
})

app.use(cors())
app.use(express.static("build"))
app.use(express.json())
app.use(morgan("tiny"))

app.use("/api/users", createUserRoute) 
app.use("/api/login", loginRouter) 

app.use(errorMiddleware.unknownEndpointHandler)
app.use(errorMiddleware.errorHandler)

module.exports = app
