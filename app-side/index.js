import { BaseSideService, settingsLib } from '@zeppos/zml/base-side'
import { normalizeDebugIndex } from '../watchface/debug-theme.js'

const DEBUG_KEY = 'debugTheme'

function readDebugTheme() {
  return normalizeDebugIndex(settingsLib.getItem(DEBUG_KEY))
}

AppSideService(
  BaseSideService({
    onRequest(req, res) {
      if (req.method === 'GET_DEBUG_THEME') {
        res(null, { debugIndex: readDebugTheme() })
        return
      }
      res(new Error(`Unsupported request: ${req.method}`))
    },
    onSettingsChange({ key }) {
      if (key === DEBUG_KEY) {
        this.call({
          type: 'DEBUG_THEME_CHANGED',
          debugIndex: readDebugTheme(),
        })
      }
    },
    onInit() {},
    onRun() {},
    onDestroy() {},
  }),
)
