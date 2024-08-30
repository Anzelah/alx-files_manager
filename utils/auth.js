import redisClient from './redis'
import dbClient from './db'

export default async function authUser(req, res) {
  try {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(400).json({ error: 'Missing token' });
    }
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    const user = await dbClient.findUserbyId(userId);
    return user
  } catch(err) {
    console.err('Error retrieving user by token:', err.message)
    return null
  }
}

