import dbClient from '../utils/db';


export const postNew = async(req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Missing email' });
  }
  if (!password) {
    return res.status(400).json({ error: 'Missing password' });
  }
  
  const user = await dbClient.findUserbyEmail(email)
  if (user) {
    return res.status(400).json({ error: 'Already exist' })
  }
  const newUser = await dbClient.createUser(email, password)

  return res.status(201).json({ id: newUser._id, email: newUser.email })
};
