const express = require('express');
const router = express.Router();

const { userIsAuthorized } = require('../middleware/checkIsAuth');
const { uploadMiddleware, gfsUploadCon } = require('../controllers/GridFsControllers/gfsUploadCon');

const {
	displayController,
	deleteController,
} = require('../controllers/GridFsControllers/gfsDashboardCon');
const browseController = require('../controllers/GridFsControllers/gfsBrowseCon');

/**
 * @desc  Goto dashboard of the user
 * @params /:id userID
 * @route GET /main/d/:id
 */
router.get('/d/:id', userIsAuthorized, displayController);

/**
 * @desc  Display all 'public' photos
 * @route GET /main/browse
 */
router.get('/browse', userIsAuthorized, browseController);

/**
 * @desc  Goto user upload section
 * @params Query params ?user=<userID>
 * @route GET /main/u/upload?user=<userID>
 */
router.get('/u/upload', userIsAuthorized, (req, res) => {
	const qUser = req.query.user;
	if (qUser === req.user.id) res.render('pages/upload');
	else res.sendStatus(401);
});

/**
 * @desc  upload the user image to mongoDB
 * @route POST /u/upload
 */
router.post('/u/upload', userIsAuthorized, uploadMiddleware, gfsUploadCon);

/**
 * @desc  delete image from mongoDB
 * @route DELETE /main/u/delete?user=<userID>&imageId=<imageID>&fileId=<fileID>&_method=DELETE
 */
router.delete('/u/delete', userIsAuthorized, deleteController);

module.exports = router;
