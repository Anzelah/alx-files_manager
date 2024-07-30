import { MongoClient } from 'mongodb';
import 'process';


const host = process.env.DB_HOST || 'localhost'
const port = process.env.DB_PORT || 27017
const database = process.env.DB_DATABASE || 'files_manager'


class DBClient {
  constructor() {
    const uri = `mongodb://${host}:${port}`
    this.client = new MongoClient(uri, { useUnifiedTopology: true })

    this.client.connect()
      .then(() => {
        console.log('Connected to server succesfully')
        this.db = this.client.db(database)
	this.db.createCollection('users')
	this.db.createCollection('files')
      })
      .catch((err) => {
        console.error(`Could not connect to server: ${err.message}`)
    });
    
  }
  isAlive() {
    return this.client.topology.isConnected()
  }

  async nbUsers() {
    return this.db.collection('users').countDocuments()
  }

  async nbFiles() {
    return this.db.collection('files').countDocuments()
  }
}

const dbClient = new DBClient();
export default dbClient;
