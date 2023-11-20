const multer = require('multer');
const path = require('path');
const { GridFsStorage } = require('multer-gridfs-storage');
const crypto = require('crypto');
const UserImage = require('../../model/UserImage');

const storage = new GridFsStorage({
	url: process.env.MONGO_URI,
	file: (req, file) => {
		return new Promise((resolve, reject) => {
			crypto.randomBytes(16, (err, buf) => {
				if (err) {
					return reject(err);
				}
				const filename = buf.toString('hex') + path.extname(file.originalname);
				const fileInfo = {
					filename: filename,
					bucketName: 'uploads',
				};
				resolve(fileInfo);
			});
		});
	},
});

const fileFilter = (req, file, cb) => {
	const allowedFileTypes = /jpeg|jpg|png/;
	const isAllowed = allowedFileTypes.test(file.mimetype);
	if (isAllowed) {
		cb(null, true);
	} else {
		cb(new Error('Invalid file type. Only JPEG, JPG, and PNG files are allowed.'), false);
	}
};

const upload = multer({
	storage: storage,
	limits: { fileSize: 1024 * 1024 * 10 },
	fileFilter,
});

const gfsUploadCon = async (req, res) => {
	const { imgName, status } = req.body;
	const imgObj = {
		fileId: req.file.id,
		name: imgName,
		status,
		contentType: req.file.mimetype,
	};
	try {
		const result = await UserImage.updateOne({ userId: req.user.id }, { $push: { img: imgObj } });
		console.log(imgObj);
		console.log(result);
		res.redirect(`/main/d/${req.user.id}}`);
	} catch (error) {
		console.error(error);
		res.sendStatus(500);
	}
};

module.exports = {
	gfsUploadCon,
	uploadMiddleware: upload.single('userImage'),
};
