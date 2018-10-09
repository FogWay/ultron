const mongoose = require('mongoose')

const MeizituSchema = new mongoose.Schema({
  title: {type: String},
  url: {type: String}
})

MeizituSchema.methods.signUp = async function (image) {
  try {
    const {title, url} = image
    this.title = title
    this.url = url
    await this.save()
    console.log(title, url)
  } catch (err) {
    return err
  }
}


module.exports = mongoose.model('Meizitu', MeizituSchema)