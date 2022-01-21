const mongoose = require("mongoose")

const blogSchema = new mongoose.Schema({
	title: {
		type: String,
		minLength: 3,
		required: true
	},
	author: {
		type: String,
		minLength: 3
	},
	url: String,
	likes: Number,
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "user"
	}
})

blogSchema.set("toJSON", {
	transform: (doc, obj) => {
		obj.id = obj._id.toString()
		delete obj._id
		delete obj.__v
	}
})

module.exports = mongoose.model("blog", blogSchema)
