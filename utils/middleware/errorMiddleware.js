const logger = require("../logger")

const unknownEndpointHandler = (req, res) => res.status(404).json({error: "unknown endpoint"})

const errorHandler = (err, req, res, next) => {
	logger.error(err.message)
	if(err.name === "CastError") {
		return res.status(400).json({
			error: "malformatted id"
		})
	} else if(err.name === "ValidationError") {
		return res.status(400).json({
			error: "validation error"
		})
	} else if(err.name === "JsonWebTokenError") {
        return res.status(400).json({
            error: "invalid token"
        })
    } else if(err.name === "TokenExpiredError") {
        return res.status(400).json({
            error: "expired token"
        })
    }
	next(err)
}

module.exports = { unknownEndpointHandler, errorHandler }
