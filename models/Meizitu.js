const mongoose = require('mongoose')

const MeizituSchema = new mongoose.Schema({
  tag_name: {type: String},
  group_name: {type: String},
  image_name: {type: String}
})

MeizituSchema.methods.saveImage = async function (image) {
  try {
    const {tag_name, group_name, image_name} = image
    this.tag_name = tag_name
    this.group_name = group_name
    this.image_name = image_name
    await this.save()
    console.log(`${tag_name}/${group_name}/${image_name}已保存至数据库`)
  } catch (err) {
    return err
  }
}


module.exports = mongoose.model('Meizitu', MeizituSchema)