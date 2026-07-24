import { COPY_PRESETS, normalizePresetIndex } from '../watchface/copy.js'

const STORAGE_KEY = 'messagePreset'

AppSettingsPage({
  build(props) {
    const stored = props.settingsStorage.getItem(STORAGE_KEY)
    const selected = normalizePresetIndex(stored)

    const buttons = COPY_PRESETS.map((preset, index) =>
      Button({
        label: `${preset.label} — ${preset.text}`,
        style: {
          width: '100%',
          marginBottom: '8px',
          padding: '10px 12px',
          borderRadius: '4px',
          background: index === selected ? '#061B31' : '#E9EDF1',
          color: index === selected ? '#F4F3E8' : '#061B31',
          fontSize: '14px',
          textAlign: 'left',
        },
        onClick: () => {
          props.settingsStorage.setItem(STORAGE_KEY, String(index))
        },
      }),
    )

    return View(
      {
        style: {
          padding: '16px 20px',
          background: '#F5F7F9',
        },
      },
      [
        Text({
          text: 'Message preset',
          style: {
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '12px',
            color: '#061B31',
          },
        }),
        ...buttons,
      ],
    )
  },
})
