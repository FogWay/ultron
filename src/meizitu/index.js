const fs = require('fs')
const url = require('url')
const path = require('path')
const charset = require('superagent-charset')
const request = charset(require('superagent'))
const cheerio = require('cheerio')
const _ = require('lodash')

const Meizitu = require('../../models/Meizitu')

const BASE_URL = 'http://www.meizitu.com/'

class MeizituImages {

  constructor() {
    this.tags = new Object()
    this.groupLinks = new Object()
  }

  start() {
    this.getTagsIndexLinks()
  }

  /*
  * 同步tags到groupLinks
  * */
  mapTagsToGroupLinks() {
    const _this = this
    for (const tagName in _this.tags) {
      _this.groupLinks[tagName] = new Array()
    }
  }

  /*
  * 获取所有标签名和标签首页地址
  * */
  async getTagsIndexLinks() {
    try {
      const _this = this
      console.log('启动：爬虫任务 http://www.meizitu.com/')
      console.log('开始：爬取所有标签和标签页面链接')
      const $ = cheerio.load((await request.get(BASE_URL).charset('gbk').buffer(true)).text)
      $('.tags a').each(function () {
        _this.tags[$(this).text()] = $(this).attr('href')
        console.log(`获得标签：${ $(this).text() }(${$(this).attr('href')})`)
      })
      console.log('完成：爬取所有标签和标签页面链接')
      _this.mapTagsToGroupLinks()
      _this.getTagsLinks()
    } catch (err) {
      console.log(err)
    }
  }

  /*
 * 获取标签所有组图页面地址
 * */
  async getTagsLinks() {
    try {
      const _this = this
      console.log('开始：爬取标签页面组图的页面链接')
      for (const tagName in _this.tags) {
        let $ = cheerio.load((await request.get(_this.tags[tagName]).charset('gbk').buffer(true)).text)
        do {
          console.log(`正在获取标签${ tagName }的第${ $('.thisclass').text() }页`)
          $('li.wp-item h3.tit a').each(function () {
            _this.groupLinks[tagName].push($(this).attr('href'))
          })
          _this.tags[tagName] = _this.getNextLink($, _this.tags[tagName])
          $ = cheerio.load((await request.get(_this.tags[tagName]).charset('gbk').buffer(true)).text)
        } while (_this.getNextLink($, _this.tags[tagName]))
        console.log(`标签${ tagName }已搜集完成`)
        // 遍历完一个标签后，下载标签下的所有图片
        _this.downloadTagImages(tagName)
      }
      console.log('*************Just enjoy*************')
    } catch (err) {
      console.log(err)
    }
  }

  /*
  * 获取下一页地址
  * */
  getNextLink($, currentLink) {
    let nextLink = ''
    $('#wp_page_numbers a').each(function () {
      if ($(this).text() === '下一页') {
        nextLink = url.resolve(currentLink, $(this).attr('href'))
      }
    })
    return nextLink
  }

  /*
  * 下载标签下的所有组图
  * */
  async downloadTagImages(tagName) {
    try {
      const _this = this
      const tagGroupsLinks = _this.groupLinks[tagName]
      fs.mkdirSync(path.join(__dirname, `../../public/${tagName}`))
      for (let i = 0; i < tagGroupsLinks.length; i++) {
        console.log(`开始请求标签${ tagName }的第${ i + 1 }项：${tagGroupsLinks[i]}`)
        const $ = cheerio.load((await request.get(tagGroupsLinks[i]).charset('gbk').buffer(true)).text)
        const groupName = $('.metaRight h2').text()
        fs.mkdirSync(path.join(__dirname, `../../public/${tagName}/${groupName}`))
        console.log(`共${ $('#picture img').length }张图片`)
        $('#picture img').each(async function (index) {
          const imageLink = $(this).attr('src')
          const imageName = _.last(_.split(imageLink, '/'))
          const downloadStream = fs.createWriteStream(path.join(__dirname, `../../public/${tagName}/${groupName}/${imageName}`))
          downloadStream.on('finish', () => {
            console.log(`${ tagName }/${ groupName }/${imageName}下载完成`)
            // TODO: 存储到MongoDB
          })
          await request
            .get(imageLink)
            .pipe(downloadStream)
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