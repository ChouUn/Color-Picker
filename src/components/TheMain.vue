<script setup lang="ts">
import * as ace from 'ace-builds'
import 'ace-builds/src-noconflict/mode-text'
import 'ace-builds/src-noconflict/theme-monokai'
import { onMounted, ref, useTemplateRef } from 'vue'
import Rope from './SpanRope.vue'

export interface Span {
  alpha: number
  color: string
  text: string
  selected: boolean
}

function Compile(spans: Span[]) {
  return spans
    .map((span) => {
      const { alpha, color, text } = span
      const alphaHex = Math.floor(alpha * 255)
        .toString(16)
        .padStart(2, '0')
      const colorHex = color.slice(1)
      const sanitized = text.replace(/\n/g, '|n')
      return `|c${alphaHex}${colorHex}${sanitized}|r`
    })
    .join('')
}

const initalSpans = [
  {
    alpha: 1,
    color: '#123456',
    text: 'Color the content as you like\n染色',
    selected: false,
  },
  {
    alpha: 1,
    color: '#789ABC',
    text: '如你所愿',
    selected: false,
  },
]

const spans = ref(initalSpans)
const sourceCode = ref(Compile(initalSpans))
const editorRef = useTemplateRef('editor')

const coloring = (color: string) => {
  const selection = window.getSelection()
  if (!selection) return

  // TODO
  console.log(color)
}

onMounted(() => {
  if (!editorRef.value) {
    console.error('editorRef is not available')
    return
  }

  const editor = ace.edit(editorRef.value, {
    // default options
  })
  editor.setTheme('ace/theme/monokai')
  editor.session.setMode('ace/mode/text')

  editor.on('change', () => {
    // TODO: spans.value = editor.getValue()
  })
})
</script>

<template>
  <div class="container md:columns-2 mx-auto bg-white p-6 shadow-lg">
    <div>
      <div>
        <button @click="coloring('red')" class="bg-red-500 text-white font-bold py-4 px-4 rounded"></button>
      </div>
      <Rope v-model="spans"></Rope>
    </div>

    <div class="editor-container md:break-before-column">
      <div ref="editor" style="height: 200px">
        {{ sourceCode }}
      </div>
    </div>
  </div>
</template>
