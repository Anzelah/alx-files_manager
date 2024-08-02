import dbClient from '../utils/db';
import redisClient from '../utils/redis';

export const getStatus = (req, res) => {
  const redis = redisClient.isAlive();
  const db = dbClient.isAlive();

  res.status(200).json({ redis, db });
};

export const getStats = async (req, res) => {
  try {
    const users = await dbClient.nbUsers();
    const files = await dbClient.nbFiles();

    res.status(200).json({ users, files });
  } catch (err) {
    console.error(err);
  }
};
