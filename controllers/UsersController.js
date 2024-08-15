import dbClient from '../utils/db';
import redisClient from '../utils/redis';

export const postNew = async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Missing email' });
  }
  if (!password) {
    return res.status(400).json({ error: 'Missing password' });
  }

  const user = await dbClient.findUserbyEmail(email);
  if (user) {
    return res.status(400).json({ error: 'Already exist' });
  }
  const newUser = await dbClient.createUser(email, password);

  return res.status(201).json({ id: newUser._id, email: newUser.email });
};

export const getMe = async (req, res) => {
  const token = req.headers['x-token'];
  const key = `auth_${token}`;
  const userId = await redisClient.get(key);
  const user = await dbClient.findUserbyId(userId);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return res.json({ id: user._id, email: user.email });
};
