<script setup lang="ts">
import * as ace from 'ace-builds'
import 'ace-builds/src-noconflict/mode-text'
import 'ace-builds/src-noconflict/theme-monokai'
import { onMounted, ref, useTemplateRef, type Ref } from 'vue'
import Rope from './SpanRope.vue'
import { collapseSpans, compileSpans, parseToSpans, type Span } from './SpanOps'

const demoText = `|cffffffffColor the content as you like|n染色|r|cfff59e0b如你所愿|r|n|n|cffdaa520|n基础攻击: 51-57|n护甲: 1.1|n攻击前摇: 0.45|n攻击间隔: 1.7|r|n|cff00ff7f生命回复速度: 0.25|r|n|cff4169e1魔法回复速度: 0.01|r|n|n|cff0042ff力量|r: 19 + 2.0|n|c00ff0303敏捷|r: 22 + 3.7|n|cff0042ff智力|r: 20 + 1.8|n|n攻击距离 300 (近战).|n移动速度 305.|n施法前摇 0.3s.`
const parsed = parseToSpans(demoText)

const spansRef = ref(parsed)
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
      <div style="background-color: rgb(20, 30, 40);" class="my-2 p-4">
        <Rope v-model="spansRef"></Rope>
      </div>
    </div>

    <div class="editor-container md:break-before-column">
      <div ref="editorNode" style="height: 200px">
        {{ demoText }}
      </div>
    </div>
  </div>
</template>
