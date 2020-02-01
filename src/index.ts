import picgo from 'picgo'

import Uploader from './uploader'

const uploader = new Uploader()

const pluginName = 'azure'

export = (ctx: picgo) => {
  const register = () => {
    ctx.helper.uploader.register(pluginName, {
      handle (ctx) {
        // tslint:disable-next-line: no-floating-promises
        uploader.handle(ctx)
      }
    })
  }
  return {
    uploader: pluginName,
    register
  }
}
