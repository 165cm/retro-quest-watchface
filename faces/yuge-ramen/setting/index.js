import { formatClock, parseTime } from '../watchface/shift.js'
import { readShiftSettings, SETTINGS_KEYS } from './keys.js'

const COCOA = '#5B4636'

AppSettingsPage({
  build(props) {
    const storage = props.settingsStorage
    const shift = readShiftSettings((key) => storage.getItem(key))

    const timeInput = (label, key, value) =>
      TextInput({
        label,
        placeholder: '11:15',
        value: formatClock(value),
        labelStyle: { fontSize: '15px', color: COCOA },
        subStyle: { fontSize: '18px', color: COCOA },
        onChange: (text) => {
          const minutes = parseTime(text)
          if (minutes !== null) storage.setItem(key, formatClock(minutes))
        },
      })

    return View({ style: { padding: '16px 20px', background: '#FFF8E7' } }, [
      Text({
        text: 'バイトのシフト',
        style: { fontSize: '18px', fontWeight: 'bold', color: COCOA, marginBottom: '8px' },
      }),
      Toggle({
        label: '文字盤にシフトの残り時間を出す',
        value: shift.enabled,
        onChange: (value) => storage.setItem(SETTINGS_KEYS.enabled, value ? 'true' : 'false'),
      }),
      timeInput('はじまり（例 11:15）', SETTINGS_KEYS.start, shift.startMin),
      timeInput('おわり（例 17:00）', SETTINGS_KEYS.end, shift.endMin),
      Text({
        text: `いまの設定：${formatClock(shift.startMin)}〜${formatClock(shift.endMin)}（${shift.enabled ? '表示する' : '表示しない'}）`,
        style: { fontSize: '14px', color: '#8A7462', marginTop: '12px' },
      }),
      Text({
        text: 'はじまりの3時間前から「しごとまで」、シフト中は「おわりまで」、おわってから2時間は「おつかれさま!」を出します。',
        style: { fontSize: '13px', color: '#8A7462', marginTop: '8px' },
      }),
    ])
  },
})
