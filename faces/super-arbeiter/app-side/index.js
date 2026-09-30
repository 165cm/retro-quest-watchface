import { BaseSideService, settingsLib } from '@zeppos/zml/base-side'
import { readBreakMinutes, SETTINGS_KEYS } from '../setting/keys.js'

function readBreak() {
  return readBreakMinutes((key) => settingsLib.getItem(key))
}

AppSideService(
  BaseSideService({
    onRequest(req, res) {
      if (req.method === 'GET_BREAK') {
        res(null, { breakMinutes: readBreak() })
        return
      }
      res(new Error(`Unsupported request: ${req.method}`))
    },
    onSettingsChange({ key }) {
      if (key === SETTINGS_KEYS.breakTime) {
        this.call({ type: 'BREAK_CHANGED', breakMinutes: readBreak() })
      }
    },
    onInit() {},
    onRun() {},
    onDestroy() {},
  }),
)
