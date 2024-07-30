import { MongoClient } from 'mongodb';

const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 27017;
const database = process.env.DB_DATABASE || 'files_manager';
const url = `mongodb://${host}:${port}/`;

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

  async nbUsers() {
    return this.usersCol.countDocuments();
  }

  async nbFiles() {
    return this.filesCol.countDocuments();
  }
}

const dbClient = new DBClient();
export default dbClient;
