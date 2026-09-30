import { log } from '@zos/utils'

const logger = log.getLogger('super-arbeiter')

App({
  globalData: {},
  onCreate() {
    logger.log('SUPER ARBEITER started')
  },
  onDestroy() {
    logger.log('SUPER ARBEITER stopped')
  },
})
