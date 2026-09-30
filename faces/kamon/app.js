import { log } from '@zos/utils'

const logger = log.getLogger('kamon')

App({
  globalData: {},
  onCreate() {
    logger.log('KAMON started')
  },
  onDestroy() {
    logger.log('KAMON stopped')
  },
})
