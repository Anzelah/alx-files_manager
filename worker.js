import dbClient from './utils/db'
import fileQueue from './controllers/FilesController'

const Queue = require('bull')
const imageThumbnail = require('image-thumbnail');

fileQueue.process( async(job, done) => {
  console.log(JSON.stringify(job.data))
  if (!job.data.fileId) {
    throw new Error('Missing fileId')
  }
  if (!job.data.userId) {
    throw new Error('Missing userId')
  }

  const { userId, userId } = job.data
  const file = await dbClient.findSpecificFile(fileId, userId)
  if (!file) {
    throw new Error('File not found')
  }
  
  const sizes = [ 500, 250, 100 ]
  let filePath = file.localPath

  for (const i of sizes) {
    const options = { i }
    const thumbnail = await imageThumbnail(filePath, options)
  }
  
})
