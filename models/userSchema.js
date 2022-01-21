const mongoose = require("mongoose")
const mongooseValidator = require("mongoose-unique-validator")

const userSchema = new mongoose.Schema({
	name: String,
	username: {
		type: String,
		unique: true,
		minLength: 3,
		required: true
	},
	passwordHash: {
		type: String,
		required: true,
	},
	blogs: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "blog"
		}
	]
})

userSchema.set("toJSON", {
	transform: (doc, obj) => {
		obj.id = obj._id.toString()
		delete obj._id
		delete obj.passwordHash
		delete obj.__v
	}
})

userSchema.plugin(mongooseValidator)

module.exports = mongoose.model("user", userSchema)
