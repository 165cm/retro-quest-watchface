import { BaseSideService, settingsLib } from '@zeppos/zml/base-side'
import { normalizePresetIndex } from '../watchface/copy.js'
import { normalizeDebugIndex } from '../watchface/debug-theme.js'

const PRESET_KEY = 'messagePreset'
const DEBUG_KEY = 'debugTheme'

function readPreset() {
  return normalizePresetIndex(settingsLib.getItem(PRESET_KEY))
}

function readDebugTheme() {
  return normalizeDebugIndex(settingsLib.getItem(DEBUG_KEY))
}

AppSideService(
  BaseSideService({
    onRequest(req, res) {
      if (req.method === 'GET_MESSAGE_PRESET') {
        res(null, { presetIndex: readPreset() })
        return
      }
      if (req.method === 'GET_DEBUG_THEME') {
        res(null, { debugIndex: readDebugTheme() })
        return
      }
      res(new Error(`Unsupported request: ${req.method}`))
    },
    onSettingsChange({ key }) {
      if (key === PRESET_KEY) {
        this.call({
          type: 'MESSAGE_PRESET_CHANGED',
          presetIndex: readPreset(),
        })
      }
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
