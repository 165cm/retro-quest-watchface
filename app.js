import { log } from '@zos/utils'
import { BaseApp } from '@zeppos/zml/base-app'

const logger = log.getLogger('pixel-wayfarer')

App(
  BaseApp({
    globalData: {},
    onCreate() {
      logger.log('Pixel Wayfarer Face started')
    },
    onDestroy() {
      logger.log('Pixel Wayfarer Face stopped')
    },
  }),
)
