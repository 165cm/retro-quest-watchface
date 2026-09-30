import { BaseSideService, settingsLib } from '@zeppos/zml/base-side'
import { readShiftSettings, SETTINGS_KEYS } from '../setting/keys.js'

function readShift() {
  return readShiftSettings((key) => settingsLib.getItem(key))
}

AppSideService(
  BaseSideService({
    onRequest(req, res) {
      if (req.method === 'GET_SHIFT') {
        res(null, { shift: readShift() })
        return
      }
      res(new Error(`Unsupported request: ${req.method}`))
    },
    onSettingsChange({ key }) {
      if (Object.values(SETTINGS_KEYS).includes(key)) {
        this.call({ type: 'SHIFT_CHANGED', shift: readShift() })
      }
    },
    onInit() {},
    onRun() {},
    onDestroy() {},
  }),
)
