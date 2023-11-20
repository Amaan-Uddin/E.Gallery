const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
	filename: String,
	contentType: String,
	length: Number,
	chunkSize: Number,
	uploadDate: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model('Image', ImageSchema);
