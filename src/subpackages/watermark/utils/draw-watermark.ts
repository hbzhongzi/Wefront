/**
 * 水印平铺绘制参数
 */
export interface WatermarkDrawOptions {
  /** 水印文字 */
  text: string
  /** 字号（相对 386 设计宽） */
  fontSize: number
  /** 透明度 0~1 */
  opacity: number
  /** 颜色 */
  color: string
  /** 旋转角度 */
  angle: number
  /** 间距（1~100） */
  spacing: number
}

/**
 * 在已绘制底图的 canvas 上下文上平铺水印文字
 * 间距算法：tile = 文字尺寸 + spacing * scale * 系数（系数拉大疏密以贴近示例）
 */
export function drawTiledWatermark(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: WatermarkDrawOptions,
) {
  if (!options.text)
    return

  const scale = Math.max(width / 386, 1)
  const fontPx = Math.max(Math.round(options.fontSize * scale), 1)
  const spacing = Math.min(Math.max(options.spacing, 1), 100)
  /** 同一滑块值下放大实际间距，贴近示例小程序疏密 */
  const gap = spacing * scale * 2

  context.save()
  context.globalAlpha = options.opacity
  context.fillStyle = options.color
  context.font = `${fontPx}px sans-serif`
  context.textBaseline = 'middle'
  context.textAlign = 'left'
  context.shadowColor = 'transparent'
  context.shadowBlur = 0
  context.shadowOffsetX = 0
  context.shadowOffsetY = 0

  context.beginPath()
  context.rect(0, 0, width, height)
  context.clip()

  context.translate(width / 2, height / 2)
  context.rotate((options.angle * Math.PI) / 180)

  const textWidth = Math.max(context.measureText(options.text).width, 1)
  const tileWidth = Math.max(textWidth + gap, 1)
  const tileHeight = Math.max(fontPx + gap, 1)
  const cover = Math.ceil(Math.sqrt(width * width + height * height)) + tileWidth

  for (let row = 0, y = -cover; y < cover; row++, y += tileHeight) {
    const offset = row % 2 === 0 ? 0 : tileWidth / 2
    for (let x = -cover + offset; x < cover; x += tileWidth)
      context.fillText(options.text, x, y)
  }

  context.restore()
}
