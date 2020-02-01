import picgo from 'picgo'
import Uploader from './uploader'

const uploader = new Uploader()

const pluginName = 'azure'

export = (ctx: picgo) => {
  const config = (ctx: picgo) => {
    let userConfig = ctx.getConfig('picBed.azure')
    if (!userConfig) {
      userConfig = {}
    }
    return [
      {
        name: 'username',
        type: 'input',
        default: userConfig.username,
        required: true,
        message: 'Username by azure.',
        alias: '用户名'
      },
      {
        name: 'project',
        type: 'input',
        default: userConfig.project,
        required: true,
        message: 'project name by azure.',
        alias: '工程名'
      },
      {
        name: 'repo',
        type: 'input',
        default: userConfig.repo,
        required: true,
        message: 'Repository name of project.',
        alias: '仓库名'
      },
      {
        name: 'token',
        type: 'input',
        default: userConfig.token,
        required: true,
        message: 'Token or password of your azure.',
        alias: 'Token或密码'
      }
    ]
  }

  const register = () => {
    ctx.helper.uploader.register(pluginName, {
      async handle(ctx) {
        await uploader.handle(ctx)
        return ctx
      },
      name: 'azure',
      config: config
    })
  }

  return {
    uploader: pluginName,
    register
  }
}
