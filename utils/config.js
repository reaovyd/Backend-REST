require("dotenv").config()

const PORT = process.env.PORT
const MONGODB_URI = process.env.NODE_ENV === "test" ? process.env.TEST_MONGODB_URI : process.env.NODE_ENV === "dev" ? process.env.DEV_MONGODB_URI : process.env.PROD_MONGODB_URI 


module.exports = { PORT, MONGODB_URI }
