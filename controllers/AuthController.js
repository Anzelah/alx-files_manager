import base64 from 'base-64';
import utf8 from 'utf8';
import { v4 as uuid } from 'uuidv4';

import dbClient from '../utils/db';
import redisClient from '../utils/redis';

function generateToken() {
  return uuid();
}

class AuthController {
  static async getConnect(req, res) {
    try {
      const authString = req.headers.authorization;
      const encoded = authString.split(' ')[1];
      const bytes = base64.decode(encoded);
      const decodedStr = utf8.decode(bytes);
      const email = decodedStr.split(':')[0];

      const user = await dbClient.findUserbyEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const token = generateToken();
      const key = `auth_${token}`;
      await redisClient.set(key, 86400, user._id);
      return res.status(200).json({ token });
    } catch(err) {
      console.error(`Internal server error: ${err.message}`)
    }
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    const user = await dbClient.findUserbyId(userId);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    await redisClient.del(key);
    return res.status(204).send();
  }
}

export default AuthController;
