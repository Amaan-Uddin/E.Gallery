const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');
const Schema = mongoose.Schema;

const UserImageSchema = new Schema({
	img: [
		{
			fileId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'UserImg',
			},
			name: String,
			/* data: Buffer,*/
			contentType: String,
			status: {
				type: String,
				enum: ['public', 'private'], // Using enum ensures data integrity by restricting the field to a specific set of allowed values.
				default: 'public',
			},
			createdAt: {
				type: Date,
				default: Date.now,
			},
		},
	],
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	},
});

UserImageSchema.plugin(findOrCreate);

module.exports = mongoose.model('UserImage', UserImageSchema);
