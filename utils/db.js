import { MongoClient, ObjectId } from 'mongodb';

const sha1 = require('sha1');

const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 27017;
const database = process.env.DB_DATABASE || 'files_manager';
const url = `mongodb://${host}:${port}/`;

function hashPassword(password) {
  const hashed = sha1(password);
  return hashed;
}

class DBClient {
  constructor() {
    MongoClient.connect(url, { useUnifiedTopology: true }, (error, client) => {
      if (!error) {
        this.db = client.db(database);
        this.usersCol = this.db.collection('users');
        this.filesCol = this.db.collection('files');
      } else {
        console.log(error.message);
        this.db = false;
      }
    });
  }

  isAlive() {
    return Boolean(this.db);
  }

  async findUserbyEmail(email) {
    try {
      const user = await this.usersCol.findOne({ email });
      return user;
    } catch (err) {
      console.error('Error finding user by email:', err.message);
      return null;
    }
  }

  async createUser(email, password) {
    try {
      const existingUser = await this.findUserbyEmail(email);
      if (existingUser) {
        return null;
      }
      const hashedPw = hashPassword(password);
      const user = await this.usersCol.insertOne({
        email,
        password: hashedPw,
      });
      return user.ops[0];
    } catch (err) {
      console.error('Error creating user:', err.message);
      return null;
    }
  }

  async findUserbyId(id) {
    try {
      const user = await this.usersCol.findOne({ _id: new ObjectId(id) });
      return user
    } catch (err) {
      console.error('Error finding user by token:', err.message);
      return null;
    }
  }

  async findFilebyId(parentId) {
    try {
      const file = await this.filesCol.findOne({ _id: new ObjectId(parentId) });
      return file;
    } catch (err) {
      console.error('Error retrieving file by parentId:', err.message);
      return null;
    }
  }
  
  async findSpecificFile(id, user) {
    try {
      const file = await this.filesCol.findOne({ _id: new ObjectId(id), userId: new ObjectId(user._id) });
      return file;
    } catch (err) {
      console.error('Error retrieving file by id and user:', err.message);
      return null;
    }
  }
  async createFile(name, type, parentId, isPublic, data, userId, localPath) {
    try {
      const existingFile = await this.findFilebyId(parentId);
      if (existingFile) {
        await this.filesCol.updateOne(
          { _id: existingFile._id },
          { $set: { userId: new ObjectId(userId) } },
        );
      }

      const fileData = {
        name,
        userId: new ObjectId(userId),
        type,
        parentId: parentId ? new ObjectId(parentId) : 0,
        isPublic,
      };
      if (type === 'file' || type === 'image') {
        fileData.localPath = localPath;
      }

      const file = await this.filesCol.insertOne(fileData);
      return file.ops[0];
    } catch (err) {
      console.error('Error retrieving file:', err.message);
      return null;
    }
  }

  async nbUsers() {
    return this.usersCol.countDocuments();
  }

  async nbFiles() {
    return this.filesCol.countDocuments();
  }
 
  async findFilesforUser(id) {
    try {
      const cursor = await this.filesCol.find({ userId: new ObjectId(id) });
      const files = await cursor.toArray()
      return files;
    } catch (err) {
      console.error('Error retrieving file by parentId:', err.message);
      return null;
    }
  }
  async paginateFiles(user, parentId, page) {
    const files = await this.filesCol.aggregate([
      { $match : { userId: new ObjectId(user._id) } },
      { $skip: (page) * 20 },
      { $limit: 20 }
    ]).toArray()
    return files
  }
}

const dbClient = new DBClient();
export default dbClient;
