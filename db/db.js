const mongoose = require('mongoose')

const DB_URL = 'mongodb://localhost:27017/sakura'

/*
* connect to mongodb
* */
mongoose.connect(DB_URL, {useNewUrlParser: true})

/*
* monitor mongodb connection
* */
mongoose.connection.on('connected', () => {
  console.log('MongoDB is connected!')
})
mongoose.connection.on('error', (err) => {
  console.log(`Error connecting to MongoDB:${err}`)
})
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB has been disconnected!')
})

module.exports = mongoose