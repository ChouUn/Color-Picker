import $ from "jquery"

export interface Span {
  color: string
  text: string
  selected: boolean
}

export function unselectAll(spans: Span[]) {
  return spans.map((span) => ({ ...span, selected: false }))
}

export function selectOne(spans: Span[], index: number) {
  return spans.map((span, i) => ({ ...span, selected: i == index }))
}

export function modifyOne(spans: Span[], index: number, text: string) {
  return spans.map((span, i) => (i == index ? { ...span, text } : span))
}

export function compileSpans(spans: Span[]) {
  const unselected = unselectAll(spans)
  const collapsed = collapseSpans(unselected)
  return collapsed
    .map((span) => {
      const { color, text } = span
      const colorHex = color.slice(1)
      const sanitized = text.replace(/\n/g, "|n")
      if (colorHex == "ffffff") {
        return sanitized
      } else {
        return `|cff${colorHex}${sanitized}|r`
      }
    })
    .join("")
}

export function detectSelection(spans: Span[]) {
  // If there is no selection,
  // it dedicates to unselect all spans.
  const selection = window.getSelection()
  if (!selection) return unselectAll(spans)
  if (!selection.focusNode) return unselectAll(spans)
  if (!selection.anchorNode) return unselectAll(spans)

  const focus = $(selection.anchorNode).parent("[data-span]")
  const anchor = $(selection.focusNode).parent("[data-span]")
  const focusIndex = focus
    .parent("[data-spans-container]")
    .children("[data-span]")
    .index(focus)
  const anchorIndex = anchor
    .parent("[data-spans-container]")
    .children("[data-span]")
    .index(anchor)
  const focusOffset = selection.anchorOffset
  const anchorOffset = selection.focusOffset

  // If start and end are the same,
  // it dedicates to click the span.
  if (focusIndex == anchorIndex && focusOffset == anchorOffset) {
    // If you're selecting a span,
    // and to click the span,
    // expect the selection to be unselected.
    if (spans[focusIndex].selected) {
      // selection.removeAllRanges()
      const unseleted = unselectAll(spans)
      const collapsed = collapseSpans(unseleted)
      return collapsed
    }

    // If you're selecting a part of a span,
    // and to click the rest of the span,
    // expect the selection to be the whole span,
    // but got the rest side of the span.

    // So, we should store the global offset from the head.
    let offset = 0
    for (let i = 0; i < focusIndex; i++) {
      offset += spans[i].text.length
    }
    offset += focusOffset

    // Then, we reset the spans to original state,
    // and find out the span that contains the offset.
    const unseleted = unselectAll(spans)
    const collapsed = collapseSpans(unseleted)
    let index = 0
    while (index < collapsed.length && offset > collapsed[index].text.length) {
      offset -= collapsed[index].text.length
      index++
    }

    // Finally, we got the correct span.
    const selected = selectOne(collapsed, index)
    return selected
  }

  // If start and end are different,
  // it dedicates to select the spans between them.
  let startIndex = focusIndex
  let startOffset = focusOffset
  let endIndex = anchorIndex
  let endOffset = anchorOffset
  if (
    focusIndex > anchorIndex ||
    (focusIndex == anchorIndex && focusOffset > anchorOffset)
  ) {
    startIndex = anchorIndex
    endIndex = focusIndex
    startOffset = anchorOffset
    endOffset = focusOffset
  }
  selection.removeAllRanges()

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
  return res
}

function push(spans: Span[], text: string) {
  spans.push({
    color: "#ffffff",
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
    if (current.text == "") continue

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
  const text = source.replace(newlinePtn, "\n")

  const colorPtn = /(\|c[0-9a-fA-F]{2}[0-9a-fA-F]{6})/g
  const endPtn = /\|r/
  const parts = text.split(colorPtn)

  const spans: Span[] = []
  let coloring = false
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    if (part == "") continue

    if (part.match(colorPtn)) {
      coloring = true
      spans.push({
        color: `#${part.slice(4, 10)}`,
        text: "",
        selected: false,
      })
    } else if (coloring && part.match(endPtn)) {
      coloring = false
      const matched = part.match(endPtn)!
      const index = matched.index!
      const head = part.slice(0, index)
      const tail = part.slice(index + matched[0].length)
      append(spans, head)
      push(spans, tail)
    } else {
      append(spans, part)
    }
  }
  return spans
}
