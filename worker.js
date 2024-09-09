import dbClient from './utils/db'
import { fileQueue } from './controllers/FilesController'

const path = require('path');
const fs = require('fs')
const imageThumbnail = require('image-thumbnail');

fileQueue.process( async(job, done) => {
  const { userId, fileId } = job.data
  if (!fileId) {
    throw new Error('Missing fileId')
  }
  if (!userId) {
    throw new Error('Missing userId')
  }

  console.log(`Retrieved user id: ${userId}`)
  console.log(`Retrieved file id: ${fileId}`)
  const file = await dbClient.findSpecificFile(fileId, userId)
  if (!file) {
    throw new Error('File not found')
  }
  console.log('This is the processing of queue')
  console.log(JSON.stringify(file))
  console.log(typeof(file)) 
  try {
    const sizes = [ 500, 250, 100 ]
    let filePath = file.localPath
    console.log(`This s the filepath: ${filePath}`)
    for (const i of sizes) {
      const options = { i }
      const thumbnail = await imageThumbnail(filePath, options)
      console.log(`This is the thumbnail: ${thumbnail}`)
      const thumbPath = path.join(filePath, `_${i}`)
      fs.writeFileSync(thumbPath, thumbnail);
    }
    done()
  } catch(err) {
      console.error('Error storing the thumbnail', err.message)
    }
})
