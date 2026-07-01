// El backend no guarda imágenes de producto, así que generamos un
// placeholder visual atractivo: un degradado estable derivado del id
// y un emoji según la categoría.

const EMOJI_BY_KEYWORD = [
  [/celul|phone|smart/i, '📱'],
  [/tecla|keyboard/i, '⌨️'],
  [/mouse|rat[oó]n/i, '🖱️'],
  [/usb|memoria|almacen/i, '🔌'],
  [/laptop|comput|dispositiv|pc/i, '💻'],
  [/audi|auricular|headset|sonido/i, '🎧'],
  [/monitor|pantalla/i, '🖥️'],
  [/camara|cámara/i, '📷'],
]

const GRADIENTS = [
  'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
  'linear-gradient(135deg, #f5f5f4 0%, #e7e5e4 100%)',
  'linear-gradient(135deg, #fef9c3 0%, #fed7aa 100%)',
  'linear-gradient(135deg, #ecfccb 0%, #d9f99d 100%)',
  'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
  'linear-gradient(135deg, #fae8ff 0%, #f5d0fe 100%)',
]

function emojiFor(categoryName = '') {
  for (const [re, emoji] of EMOJI_BY_KEYWORD) {
    if (re.test(categoryName)) return emoji
  }
  return '🛍️'
}

export default function ProductThumb({ id = 0, categoryName = '', size = 'card' }) {
  const gradient = GRADIENTS[id % GRADIENTS.length]
  return (
    <div className={`product-thumb product-thumb--${size}`} style={{ background: gradient }}>
      <span aria-hidden="true">{emojiFor(categoryName)}</span>
    </div>
  )
}
