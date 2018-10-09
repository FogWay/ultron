/*
* Connect to mongoDB
* */
require('./db/db')

/*
* Download pictures from http://www.meizitu.com/
* */
const meizitu = require('./src/meizitu')
meizitu.start()