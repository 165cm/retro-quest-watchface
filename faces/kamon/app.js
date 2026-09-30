import { log } from '@zos/utils'

const logger = log.getLogger('kamon')

App({
  globalData: {},
  onCreate() {
    logger.log('KAMONT started')
  },
  onDestroy() {
    logger.log('KAMONT stopped')
  },
})
