import $ from 'jquery'

export interface Span {
  color: string
  text: string
  selected: boolean
}

export function compileSpans(spans: Span[]) {
  return spans
    .map((span) => {
      const { color, text } = span
      const colorHex = color.slice(1)
      const sanitized = text.replace(/\n/g, '|n')
      return `|cff${colorHex}${sanitized}|r`
    })
    .join('')
}

function unselectAll(spans: Span[]) {
  return spans.map((span) => ({ ...span, selected: false }))
}

function selectOne(spans: Span[], index: number) {
  return spans.map((span, i) => ({ ...span, selected: i == index }))
}

export function detectSelection(spans: Span[]) {
  /**
   * If there is no selection, unselect all spans
   */
  const selection = window.getSelection()
  if (!selection) return unselectAll(spans)
  if (!selection.focusNode) return unselectAll(spans)
  if (!selection.anchorNode) return unselectAll(spans)

  /**
   * If start and end are the same, select the one span
   */
  const focus = $(selection.anchorNode).parent('[data-span]')
  const anchor = $(selection.focusNode).parent('[data-span]')
  console.log('start', focus[0])
  console.log('end', anchor[0])
  const focusIndex = focus.parent('[data-spans-container]').children('[data-span]').index(focus)
  const anchorIndex = anchor.parent('[data-spans-container]').children('[data-span]').index(anchor)
  const focusOffset = selection.anchorOffset
  const anchorOffset = selection.focusOffset
  selection.removeAllRanges()

  console.log(
    'focusIndex',
    focusIndex,
    'focusOffset',
    focusOffset,
    'anchorIndex',
    anchorIndex,
    'anchorOffset',
    anchorOffset,
  )

  if (focusIndex == anchorIndex && focusOffset == anchorOffset) {
    return selectOne(spans, focusIndex)
  }

  /**
   * If start and end are different, select the spans between them
   */
  let startIndex = focusIndex
  let startOffset = focusOffset
  let endIndex = anchorIndex
  let endOffset = anchorOffset
  if (focusIndex > anchorIndex || (focusIndex == anchorIndex && focusOffset > anchorOffset)) {
    startIndex = anchorIndex
    endIndex = focusIndex
    startOffset = anchorOffset
    endOffset = focusOffset
  }
  console.log(
    'startIndex',
    startIndex,
    'startOffset',
    startOffset,
    'endIndex',
    endIndex,
    'endOffset',
    endOffset,
  )

  const res = []
  for (let i = 0; i < spans.length; i++) {
    const span = spans[i]
    if (i < startIndex || i > endIndex) {
      res.push({
        ...span,
        selected: false,
      })
    } else if (i > startIndex && i < endIndex) {
      res.push({
        ...span,
        selected: true,
      })
    } else if (i == startIndex && i == endIndex) {
      res.push({
        ...span,
        selected: false,
        text: span.text.slice(0, startOffset),
      })
      res.push({
        ...span,
        selected: true,
        text: span.text.slice(startOffset, endOffset),
      })
      res.push({
        ...span,
        selected: false,
        text: span.text.slice(endOffset),
      })
    } else if (i == startIndex) {
      res.push({
        ...span,
        selected: false,
        text: span.text.slice(0, startOffset),
      })
      res.push({
        ...span,
        selected: true,
        text: span.text.slice(startOffset),
      })
    } else if (i == endIndex) {
      res.push({
        ...span,
        selected: true,
        text: span.text.slice(0, endOffset),
      })
      res.push({
        ...span,
        selected: false,
        text: span.text.slice(endOffset),
      })
    }
  }
  console.log('res', res)
  return res
}

function push(spans: Span[], text: string) {
  spans.push({
    color: '#ffffff',
    text,
    selected: false,
  })
}

function append(spans: Span[], text: string) {
  if (spans.length == 0) {
    push(spans, text)
  } else {
    const last = spans[spans.length - 1]
    spans[spans.length - 1] = {
      ...last,
      text: last.text + text,
    }
  }
}

export function collapseSpans(spans: Span[]) {
  if (spans.length == 0) return []

  const res: Span[] = []
  for (let i = 0; i < spans.length; i++) {
    const current = spans[i]
    if (current.text == '') continue

    if (res.length == 0) {
      res.push(current)
      continue
    }
    const prev = res[res.length - 1]

    if (prev.color == current.color && prev.selected == current.selected) {
      append(res, current.text)
    } else {
      res.push(current)
    }
  }
  return res
}

export function parseToSpans(source: string) {
  const newlinePtn = /\|n/g
  const text = source.replace(newlinePtn, '\n')

  const colorPtn = /(\|c[0-9a-fA-F]{2}[0-9a-fA-F]{6})/g
  const endPtn = /\|r/
  const parts = text.split(colorPtn)

  console.log('parts', parts)

  const spans: Span[] = []
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    if (part == '') continue

    if (part.match(colorPtn)) {
      spans.push({
        color: `#${part.slice(4, 10)}`,
        text: '',
        selected: false,
      })
    } else if (part.match(endPtn)) {
      const [head, tail] = part.split(endPtn)
      append(spans, head)
      push(spans, tail)
    } else {
      append(spans, part)
    }
  }
  console.log('spans', spans)
  return spans
}
