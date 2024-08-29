import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';

const express = require('express');
const router = express.Router();

const { getStatus, getStats } = require('../controllers/AppController');
const { postNew, getMe } = require('../controllers/UsersController');

router.get('/status', getStatus);
router.get('/stats', getStats);
router.post('/users', postNew);

router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.get('/users/me', getMe);

router.post('/files', FilesController.postUpload);
router.get('/files/:id', FilesController.getShow)
router.get('/files', FilesController.getIndex)

router.put('/files/:id/publish', FilesController.putPublish)
router.put('/files/:id/unpublish', FilesController.putUnpublish)

module.exports = router;
