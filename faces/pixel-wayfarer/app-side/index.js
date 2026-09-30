import { BaseSideService, settingsLib } from '@zeppos/zml/base-side'
import { normalizePresetIndex } from '../watchface/copy.js'

const STORAGE_KEY = 'messagePreset'

function readPreset() {
  return normalizePresetIndex(settingsLib.getItem(STORAGE_KEY))
}

AppSideService(
  BaseSideService({
    onRequest(req, res) {
      if (req.method === 'GET_MESSAGE_PRESET') {
        res(null, { presetIndex: readPreset() })
        return
      }
      res(new Error(`Unsupported request: ${req.method}`))
    },
    onSettingsChange({ key }) {
      if (key === STORAGE_KEY) {
        this.call({
          type: 'MESSAGE_PRESET_CHANGED',
          presetIndex: readPreset(),
        })
      }
    },
    onInit() {},
    onRun() {},
    onDestroy() {},
  }),
)
