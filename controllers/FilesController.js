import redisClient from '../utils/redis';
import dbClient from '../utils/db';
import { uuid } from 'uuidv4';
const { Buffer } = require('buffer');
const fs = require('fs');
const path = require('path');

class FilesController {
  static async postUpload(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(400).json({ error: 'Missing token' });
    }
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    const user = await dbClient.findUserbyId(userId);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let data;
    const { name, type, parentId = 0, isPublic = false } = req.body;
    if (type === 'file' || type === 'image') {
      data = req.body.data
    }

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }
    const typesArr = ['folder', 'file', 'image'];
    if (!type || !typesArr.includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }
    if (!data && type !== 'folder') {
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
    
    let localPath
    if (type !== 'folder') {
      const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager'
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath)
      }
      const filename = uuid()
      localPath = path.join(folderPath, filename)
      const content = Buffer.from(data, 'base64')
      try {
        fs.writeFileSync(localPath, content)
      } catch(err) {
        console.error('Error storing the file:', err.message)
      }
    }
    
    const newFile = await dbClient.createFile(name, type, parentId, isPublic, data, userId, localPath);
    return res.status(201).json({
      id: newFile._id,
      userId,
      name,
      type,
      isPublic,
      parentId
    });
  }
}

export default FilesController;
