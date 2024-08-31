import { uuid } from 'uuidv4';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';
import authUser from '../utils/auth';

const { Buffer } = require('buffer');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const fileQueue = new Bull('image transcoding')

class FilesController {
  static async postUpload(req, res) {
    const user = await authUser(req, res)
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
   
    let data;
    const {
      name, type, parentId = 0, isPublic = false,
    } = req.body;
    if (type === 'file' || type === 'image') {
      data = req.body.data;
    }

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }
    const typesArr = ['folder', 'file', 'image'];
    if (!type || !typesArr.includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }
    if (!data && (type !== 'folder')) {
      return res.status(400).json({ error: 'Missing data' });
    }

    if (parentId) {
      const file = await dbClient.findFilebyId(parentId);
      if (!file) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (file.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }
    
    let myFile;
    let localPath;
    myFile = await dbClient.findFilebyId(user._id)
    if (type !== 'folder') {
      const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
      }

      const filename = uuid();
      localPath = path.join(folderPath, filename);
      const content = Buffer.from(data, 'base64').toString('utf8');

      try {
	if (type === 'image') {
          fs.writeFileSync(localPath, content);
          const job = await fileQueue.add({
	    fileId: myFile._id,
	    userId: myFile.userId
	  })
	} else {
	  fs.writeFileSync(localPath, content);
	}

       } catch (err) {
         console.error('Error storing the file:', err.message);
       }
     }
   

    const newFile = await dbClient.createFile(name, type, parentId, isPublic, data, userId, localPath);
    return res.status(201).json({
      id: newFile._id,
      userId: newFile.userId,
      name: newFile.name,
      type: newFile.type,
      isPublic: newFile.isPublic,
      parentId: newFile.parentId,
    });
  }

  static async getShow(req, res) {
    const user = await authUser(req, res);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { id } = req.params;
    const file = await dbClient.findSpecificFile(id, user);
    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }
    return res.status(200).json(file);
  }

  static async getIndex(req, res) {
    try {
      const user = await authUser(req, res);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const parentId = (req.query.parentId) || 0;
      const page = parseInt(req.query.page, 10) || 0;
      const paginatedFiles = await dbClient.paginateFiles(user, parentId, page);
      return res.status(200).json(paginatedFiles);
    } catch (err) {
      console.error('Error retrieving files', err.message);
      return res.status(200).json([]);
    }
  }

  static async putPublish(req, res) {
    const user = await authUser(req, res);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { id } = req.params;
    const file = await dbClient.findSpecificFile(id, user);
    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    file.isPublic = true;
    await dbClient.updateFile(id, { isPublic: true });
    return res.status(200).json(file);
  }

  static async putUnpublish(req, res) {
    const user = await authUser(req, res);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { id } = req.params;
    const file = await dbClient.findSpecificFile(id, user);
    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    file.isPublic = false;
    await dbClient.updateFile(id, { isPublic: false });
    return res.status(200).json(file);
  }

  static async getFile(req, res) {
    const { id } = req.params;
    const file = await dbClient.findFilebyId(id);
    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    const user = await authUser(req, res);
    if (file.isPublic === false && (!user || (user._id.toString() !== file.userId.toString()))) {
      return res.status(404).json({ error: 'Not found' });
    }
    if (file.type === 'folder') {
      return res.status(400).json({ error: "A folder doesn't have content" });
    }
    if (!file.localPath) {
      return res.status(404).json({ error: 'Not found' });
    }

    const mimeType = mime.contentType(file.name);
    const content = fs.readFileSync(file.localPath, mime.charset(mimeType));
    return res.set('Content-Type', mimeType).send(content);
  }
}

module.exports = fileQueue
export default FilesController;
