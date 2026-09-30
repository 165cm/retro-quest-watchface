import { formatClock, parseTime } from '../../../shared/clock.js'
import { readBreakMinutes, SETTINGS_KEYS } from './keys.js'

const BLACK = '#000000'

AppSettingsPage({
  build(props) {
    const storage = props.settingsStorage
    const breakMinutes = readBreakMinutes((key) => storage.getItem(key))

    return View({ style: { padding: '16px 20px', background: '#FFF5D6' } }, [
      Text({
        text: 'BREAK（休憩の時刻）',
        style: { fontSize: '18px', fontWeight: 'bold', color: BLACK, marginBottom: '8px' },
      }),
      TextInput({
        label: '休憩の時刻（例 15:00）',
        placeholder: '15:00',
        value: formatClock(breakMinutes),
        labelStyle: { fontSize: '15px', color: BLACK },
        subStyle: { fontSize: '18px', color: '#E10606' },
        onChange: (text) => {
          const minutes = parseTime(text)
          if (minutes !== null) storage.setItem(SETTINGS_KEYS.breakTime, formatClock(minutes))
        },
      }),
      Text({
        text: `いまの設定：${formatClock(breakMinutes)}。文字盤の赤い BREAK の箱に出ます。`,
        style: { fontSize: '14px', color: '#6B4A1E', marginTop: '12px' },
      }),
    ])
  },
})
