const fs = require('fs')
const charset = require('superagent-charset')
const request = charset(require('superagent'))
const cheerio = require('cheerio')

const Meizitu = require('../../models/Meizitu')

const BASE_URL = 'http://www.meizitu.com/'

class MeizituImages {

  constructor() {
    this.tags = new Object()
    this.groupLinks = new Object()
  }

  start() {
    this.getTags()
  }

  getTags() {
    try {
      console.log('启动：爬虫任务 http://www.meizitu.com/')
      console.log('开始：爬取所有标签和标签页面链接')
      const _this = this
      request
        .get(BASE_URL)
        .charset('gbk')
        .end((err, res) => {
          if (err) {
            console.log(err)
          } else {
            const $ = cheerio.load(res.text)
            $('.tags a').each(function () {
              _this.tags[$(this).text()] = $(this).attr('href')
              console.log(`获得标签：${ $(this).text() }(${$(this).attr('href')})`)
            })
            console.log('完成：爬取所有标签和标签页面链接')
            _this.getTagsLinks()
          }
        })
    }
    catch (err) {
      console.log(err)
    }
  }

  getTagsLinks() {
    try {
      console.log('开始：爬取标签页面组图的页面链接')
      const _this = this
      for (const tag in _this.tags) {
        request
          .get(_this.tags[tag])
          .charset('gbk')
          .end((err, res) => {
            if (err) {
              console.log(err)
            } else {
              const $ = cheerio.load(res.text)
              $('li.wp-item h3.tit a').each(function () {
                const groupSource = $(this).attr('href')
                console.log(groupSource)
              })
            }
          })

      }
    } catch (err) {
      console.log(err)
    }
  }
}

module.exports = new MeizituImages()

// const timestamp = new Date().getTime()
// const filePath = `/learnspace/ultron/public/${timestamp}.gif`
// http.get(groupSource)
//   .pipe(fs.createWriteStream(filePath))
//   .on('close', function () {
//     console.log(`Picture ${ URL + src } saved`)
//   })