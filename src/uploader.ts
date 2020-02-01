import base64 from 'base64-js'
import { readFile, readFileSync } from 'fs'
import { Base64 } from 'js-base64'
import picgo from 'picgo'

export default class Uploader {
  async handle (ctx: picgo) {
    for (let i in ctx.input) {
      let img = this.upload(ctx, ctx.input[i])
      await img.then(imgUrl => {
        ctx.log.info(imgUrl)
        ctx.output[i].url = imgUrl
      })
    }
  }

  upload = async (ctx: picgo, filePath: string) => {
    let f = readFileSync(filePath)

    let imgStr = base64.fromByteArray(f)
    const config = ctx.getConfig('picBed.azure')

    let org = config.username
    let project = config.project
    let repo = config.repo
    let username = config.username
    let token = config.token

    let time = Date.now() + '_' + Math.floor(Math.random() * 10000)

    let extName = 'png'

    if (extName !== '') {
      extName = `.${extName}`
    }

    let name = `${time}${extName}`

    let uri = `https://dev.azure.com/${org}/${project}/_apis/git/repositories/${
        repo}/pushes?api-version=5.0`

    let listResp = await ctx.Request.request({ method: 'get', uri: uri })

    let commitUrl = JSON.parse(listResp).value[0].url

    let commitResp = await ctx.Request.request({ method: 'get', uri: commitUrl })

    let lastCommitId = JSON.parse(commitResp).commits[0].commitId

    let basicStr = `${username}:${token}`

    basicStr = Base64.encode(basicStr)

    let auth = `basic ${basicStr}`

    let body = {
      refUpdates: [{ name: 'refs/heads/master', oldObjectId: lastCommitId }],
      commits: [{
        comment: 'Upload by picgo-plugin-azure',
        changes: [{
          changeType: 'add',
          item: { path: name },
          newContent: { content: imgStr, contentType: 'base64Encoded' }
        }]
      }]
    }

    let response = await ctx.Request.request({
      method: 'post',
      uri: uri,
      headers: { Authorization: auth, 'content-type': 'application/json' },
      body: JSON.stringify(body)
    })

    let repoUrl = JSON.parse(response).repository.url
    return `${repoUrl}/items?path=%2F${
        name}&versionDescriptor%5BversionOptions%5D=0&versionDescriptor%5BversionType%5D=0&versionDescriptor%5Bversion%5D=master&resolveLfs=true&%24format=octetStream&api-version=5.0`
  }
}
