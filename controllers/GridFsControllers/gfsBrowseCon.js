const UserImage = require('../../model/UserImage');

const util = require('util');
const findOrCreate = util.promisify(require('mongoose-findorcreate'));
const streamToArrayPromise = util.promisify(require('stream-to-array'));

const mongoose = require('mongoose');
const Grid = require('gridfs-stream');

let gfs, gridfsBucket;
mongoose.connection.once('open', () => {
	gridfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
		bucketName: 'uploads',
	});
	gfs = Grid(mongoose.connection.db, mongoose.mongo);
	gfs.collection('uploads');
});

function formatBase64Image(file) {
	return new Promise(async (resolve, reject) => {
		try {
			const readstream = gridfsBucket.openDownloadStream(file._id);
			const chunks = await streamToArrayPromise(readstream);
			const buffer = Buffer.concat(chunks);
			const base64String = buffer.toString('base64');
			const base64Image = `data:${file.contentType};base64,${base64String}`;
			resolve(base64Image);
		} catch (error) {
			console.error(error);
			reject(error);
		}
	});
}

const browseController = async (req, res) => {
	try {
		const userImgCollection = await UserImage.aggregate([
			{ $unwind: '$img' },
			{ $match: { 'img.status': 'public' } },
			{
				$lookup: {
					from: 'users', // Replace 'users' with the actual name of your user collection
					localField: 'userId', // The field in the current collection
					foreignField: '_id', // The field in the user collection
					as: 'userData', // The alias for the joined user data
				},
			},
			{ $unwind: '$userData' },
			{ $project: { _id: 0, user: '$userData', img: 1 } },
		]);
		if (!userImgCollection.length) {
			res.render('pages/browse.ejs', {
				userDetails: req.user,
				imageArray: [],
			});
		} else {
			let imageArray = [];
			const allowedExt = ['image/jpeg', 'image/jpg', 'image/png'];
			try {
				await Promise.all(
					userImgCollection.map(async (item) => {
						const file_id = item.img.fileId;
						const file = await gfs.files.findOne({ _id: file_id });
						if (!file || file.length === 0) {
							console.log('failed');
							return;
						}

						if (allowedExt.includes(file.contentType)) {
							const finalImage = await formatBase64Image(file);
							let obj = {
								image: finalImage,
								filename: item.img.name,
								createdAt: file.uploadDate,
								user: item.user.displayName,
							};
							imageArray.push(obj);
						}
					})
				);
				res.render('pages/browse', {
					userDetails: req.user,
					imageArray: imageArray,
				});
			} catch (error) {
				console.error(error);
				res.sendStatus(404);
			}
		}
	} catch (error) {
		console.error(error);
	}
};

module.exports = browseController;
