<script setup lang="ts">
import * as ace from 'ace-builds'
import 'ace-builds/src-noconflict/mode-text'
import 'ace-builds/src-noconflict/theme-monokai'
import { onMounted, ref, useTemplateRef, type Ref } from 'vue'
import Rope from './SpanRope.vue'
import { collapseSpans, compileSpans, parseToSpans, type Span } from './SpanOps'

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

const spansRef = ref(initalSpans)
const editorNodeRef = useTemplateRef('editorNode')
const editorRef: Ref<ace.Ace.Editor | undefined> = ref()
const colors = ref(['#000000', '#ffffff', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#6366f1'])

const coloring = (color: string) => {
  const next = spansRef.value.map((span) => ({
    ...span,
    color: span.selected ? color : span.color,
  }))
  nextSpans(next)
}

const nextSpans = (spans: Span[]) => {
  const next = collapseSpans(spans)
  console.log('next', next)

  const compiled = compileSpans(next)
  if (editorRef.value!.getValue() != compiled) {
    editorRef.value!.setValue(compiled)
  }

  spansRef.value = next
  return next
}

onMounted(() => {
  if (!editorNodeRef.value) {
    console.error('editorRef is not available')
    return
  }

  const editor = ace.edit(editorNodeRef.value, {
    // default options
  })
  editor.setTheme('ace/theme/monokai')
  editor.session.setMode('ace/mode/text')

  editor.on('change', () => {
    // TODO: spans.value = editor.getValue()
    const spans = parseToSpans(editor.getValue())
    nextSpans(spans)
  })
  editorRef.value = editor
})
</script>

<template>
  <div class="container md:columns-2 mx-auto bg-white p-6 shadow-lg">
    <div>
      <div>
        <button v-for="color in colors" :key="color" @click="coloring(color)"
          class="font-bold py-4 px-4 border-2 rounded" :style="{ backgroundColor: color }"></button>
      </div>
      <Rope v-model="spansRef"></Rope>
    </div>

    <div class="editor-container md:break-before-column">
      <div ref="editorNode" style="height: 200px">
        {{ compileSpans(initalSpans) }}
      </div>
    </div>
  </div>
</template>
