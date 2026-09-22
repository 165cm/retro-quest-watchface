import {
  DEBUG_CYCLE,
  DEBUG_MODES,
  DEBUG_OFF,
  normalizeDebugIndex,
} from '../watchface/debug-theme.js'

const DEBUG_KEY = 'debugTheme'

const DEBUG_LABELS = {
  [DEBUG_OFF]: 'Off — follow real weather',
  [DEBUG_CYCLE]: 'Cycle all themes (every 3s)',
}

function debugLabel(mode) {
  if (DEBUG_LABELS[mode]) return DEBUG_LABELS[mode]
  return mode.replace(/_/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase())
}

function sectionTitle(text, marginTop) {
  return Text({
    text,
    style: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginTop,
      marginBottom: '12px',
      color: '#061B31',
    },
  })
}

function note(text) {
  return Text({
    text,
    style: {
      fontSize: '12px',
      lineHeight: '17px',
      marginBottom: '12px',
      color: '#5A6B7A',
    },
  })
}

function optionButton({ label, selected, onClick }) {
  return Button({
    label,
    style: {
      width: '100%',
      marginBottom: '8px',
      padding: '10px 12px',
      borderRadius: '4px',
      background: selected ? '#061B31' : '#E9EDF1',
      color: selected ? '#F4F3E8' : '#061B31',
      fontSize: '14px',
      textAlign: 'left',
    },
    onClick,
  })
}

AppSettingsPage({
  build(props) {
    const selectedDebug = normalizeDebugIndex(props.settingsStorage.getItem(DEBUG_KEY))

    const debugButtons = DEBUG_MODES.map((mode, index) =>
      optionButton({
        label: debugLabel(mode),
        selected: index === selectedDebug,
        onClick: () => props.settingsStorage.setItem(DEBUG_KEY, String(index)),
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
        sectionTitle('Background preview (debug)', '0'),
        note(
          'Forces a background and weather icon so every theme can be checked on the watch. ' +
            'Cycle advances through all 10 themes every 3 seconds; it runs only while the ' +
            'watchface is on screen. Set this back to Off for normal use — it overrides real weather.',
        ),
        ...debugButtons,
      ],
    )
  },
})
