import dbClient from '../utils/db';
import redisClient from '../utils/redis';
const base64 = require('base-64')
const utf8 = require('utf8')
const { uuid } = require('uuidv4');


function generateToken() {
  return uuid()
}

export const getConnect = async(req, res) => {
  const authString = req.headers.authorization
  const encoded = authString.split(' ')[1]
  const bytes = base64.decode(encoded)
  const decodedStr = utf8.decode(bytes)
  const email = decodedStr.split(':')[0]
  
  const user = await dbClient.findUserbyEmail(email)
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" })
  }
  console.log(user)
  const token = generateToken()
  const key = `auth_${token}`
  await redisClient.set(key, 86400, token)
  const results = await redisClient.get(key)
  return res.status(200).json({ token: results })
}

export const getDisconnect = async(req, res) => {
  const token = req.headers['x-token']
  const user = await dbClient.findUserbyToken(token)
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" })
  }
  const key = `auth_${token}`
  await redisClient.del(key)
  return res.status(204)
}
