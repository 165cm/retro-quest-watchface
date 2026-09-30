// 紋とタイトルの一覧。画面が点くたびに、この中からランダムに1つを出す（ガチャ）。
// title は紋の昔からの意味から取った英単語（8文字まで。赤い線の間に収めるため）。
// 並び順は画像の番号（images/crests/<番号>.png・images/titles/<番号>.png）。足す時は末尾に。
export const CRESTS = Object.freeze([
  { id: 'shippo', name: '七宝', title: 'ETERNAL', meaning: 'Linked rings that never end' },
  { id: 'tombo', name: '蜻蛉', title: 'VALOR', meaning: 'The dragonfly only flies forward — the "victory bug"' },
  { id: 'taka', name: '並び鷹の羽', title: 'ASCEND', meaning: 'Hawk feathers, the pride of warriors' },
  { id: 'take', name: '竹', title: 'UNBOWED', meaning: 'Bamboo bends in the storm but never breaks' },
  { id: 'nami', name: '青海波', title: 'SURGE', meaning: 'Endless waves, always moving on' },
  { id: 'tomoe', name: '三つ巴', title: 'MOMENTUM', meaning: 'Whirling commas of unstoppable force' },
  { id: 'ya', name: '違い矢', title: 'RESOLVE', meaning: 'Arrows fly straight to the mark' },
  { id: 'sakura', name: '桜', title: 'FLOURISH', meaning: 'Blossoms that bloom fully in their moment' },
  // レア：金色。めったに出ない
  { id: 'hiashi', name: '日足', title: 'ZENITH', meaning: 'The sun at its highest point', rare: true },
])

// レアが出る確率（画面が点くたび）
export const RARE_CHANCE = 0.05

const NORMAL = CRESTS.map((crest, index) => index).filter((index) => !CRESTS[index].rare)
const RARE = CRESTS.map((crest, index) => index).filter((index) => CRESTS[index].rare)

// 次に出す紋の番号。直前（previous）と同じ紋は出さない。random は 0 以上 1 未満を返す関数
export function pickCrest(previous, random = Math.random) {
  if (RARE.length > 0 && !RARE.includes(previous) && random() < RARE_CHANCE) {
    return RARE[Math.floor(random() * RARE.length)]
  }
  const choices = NORMAL.filter((index) => index !== previous)
  return choices[Math.floor(random() * choices.length)]
}

export const crestImage = (index) => `images/crests/${index}.png`
export const titleImage = (index) => `images/titles/${index}.png`
