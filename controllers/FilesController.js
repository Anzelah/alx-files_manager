import redisClient from '../utils/redis';
import dbClient from '../utils/db';


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
    
    const { name, type } = req.body;
    const parentId = req.body.parentId || 0
    const isPublic = req.body.isPublic || false
    if (type == 'file' || type == 'image') {
      const data = req.body.data
    }

    if (!name) {
      return res.status(400).json({ error: 'Missing name' })
    }
    const typesArr = [ 'folder', 'file', 'image' ]
    if (!type || !typesArr.includes(type)) {
      return res.status(400).json({ error: 'Missing type' })
    }
    if (!data || type != 'folder') {
      return res.status(400).json({ error: 'Missing data' })
    }
  }
}

export default FilesController;
