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
  }
}

export default FilesController;
