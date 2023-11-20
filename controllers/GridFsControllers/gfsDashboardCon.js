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

const displayController = async (req, res) => {
	try {
		const userImgCollection = await UserImage.findOrCreate({ userId: req.user.id });
		if (!userImgCollection.doc.img.length) {
			res.render('pages/dashboard', {
				userDetails: req.user,
				ImgCollection: userImgCollection,
				imageArray: [],
			});
		} else {
			let imageArray = [];
			const allowedExt = ['image/jpeg', 'image/jpg', 'image/png'];
			try {
				await Promise.all(
					userImgCollection.doc.img.map(async (item) => {
						const file_id = item.fileId;
						const file = await gfs.files.findOne({ _id: file_id });
						if (!file || file.length === 0) {
							console.log('Failed: Invalid File or NOT FOUND');
							return;
						}

						if (allowedExt.includes(file.contentType)) {
							const finalImage = await formatBase64Image(file);
							let obj = {
								id: item.id,
								fileId: file_id,
								image: finalImage,
								filename: item.name,
								createdAt: file.uploadDate,
								status: item.status,
							};
							imageArray.push(obj);
						}
					})
				);
				res.render('pages/dashboard', {
					userDetails: req.user,
					ImgCollection: userImgCollection,
					imageArray: imageArray,
				});
			} catch (error) {
				console.error(error);
				res.sendStatus(404);
			}
		}
	} catch (error) {
		console.error(error);
		res.sendStatus(500);
	}
};

const deleteController = async (req, res) => {
	const { user, imageId, fileId } = req.query;
	if (user !== req.user.id) return res.sendStatus(403);
	try {
		gridfsBucket.delete(new mongoose.Types.ObjectId(fileId));
		await UserImage.updateOne({ id: imageId }, { $pull: { img: { fileId: fileId } } });
		res.redirect(`/main/d/${user}`);
	} catch (error) {
		console.error(error);
		res.sendStatus(500);
	}
};

module.exports = {
	displayController,
	deleteController,
};
