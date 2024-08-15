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
      return user;
    } catch (err) {
      console.error('Error finding user by token:', err.message);
      return null;
    }
  }

  async nbUsers() {
    return this.usersCol.countDocuments();
  }

  async nbFiles() {
    return this.filesCol.countDocuments();
  }
}

const dbClient = new DBClient();
export default dbClient;
