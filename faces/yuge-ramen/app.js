import { log } from '@zos/utils'
import { BaseApp } from '@zeppos/zml/base-app'

const logger = log.getLogger('yuge-ramen')

App(
  BaseApp({
    globalData: {},
    onCreate() {
      logger.log('Yuge Ramen Face started')
    },
    onDestroy() {
      logger.log('Yuge Ramen Face stopped')
    },
  }),
)
