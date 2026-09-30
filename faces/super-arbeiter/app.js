import { log } from '@zos/utils'
import { BaseApp } from '@zeppos/zml/base-app'

const logger = log.getLogger('super-arbeiter')

App(
  BaseApp({
    globalData: {},
    onCreate() {
      logger.log('SUPER ARBEITER started')
    },
    onDestroy() {
      logger.log('SUPER ARBEITER stopped')
    },
  }),
)
