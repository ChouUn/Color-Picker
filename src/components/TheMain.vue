<script setup lang="ts">
import { ref } from "vue"
import {
  collapseSpans,
  detectSelection,
  compileSpans,
  parseToSpans,
  type Span,
  modifyOne,
} from "./SpanOps"

const sourceText = `Color the content as you like|n染色|cfff59e0b如你所愿|r|n|n|cffdaa520|n基础攻击: 51-57|n护甲: 1.1|n攻击前摇: 0.45|n攻击间隔: 1.7|r|n|cff00ff7f生命回复速度: 0.25|r|n|cff4169e1魔法回复速度: 0.01|r|n|n|cff0042ff力量|r: 19 + 2.0|n|cffff0303敏捷|r: 22 + 3.7|n|cff0042ff智力|r: 20 + 1.8|n|n攻击距离 300 (近战).|n移动速度 305.|n施法前摇 0.3s.`
const parsed = parseToSpans(sourceText)

const spansRef = ref(parsed)
const sourceRef = ref(sourceText)
const colors = ref([
  "#000000",
  "#ffffff",
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#6366f1",
])

const coloring = (color: string) => {
  const next = spansRef.value.map((span) => ({
    ...span,
    color: span.selected ? color : span.color,
  }))
  nextSpans(next)
}

const nextSpans = (spans: Span[]) => {
  const collapsed = collapseSpans(spans)

  const compiled = compileSpans(collapsed)
  sourceRef.value = compiled

  spansRef.value = collapsed
  return collapsed
}

const changeSource = () => {
  const spans = parseToSpans(sourceRef.value)
  nextSpans(spans)
}

const select = () => {
  const spans = detectSelection(spansRef.value)
  nextSpans(spans)
}

const input = (e: Event, index: number) => {
  const spanEl = e.target as HTMLSpanElement
  const spans = modifyOne(spansRef.value, index, spanEl.textContent || "")
  nextSpans(spans)
}
</script>

<template>
  <div
    class="container mx-auto grid grid-cols-1 bg-white p-6 shadow-lg md:grid-cols-2"
  >
    <div>
      <div>
        <button
          v-for="color in colors"
          class="rounded border-2 p-4 font-bold"
          :style="{ backgroundColor: color }"
          :key="color"
          @click="coloring(color)"
        ></button>
      </div>
      <div
        style="background-color: rgb(20, 30, 40)"
        class="my-2 p-4"
      >
        <div>
          <pre
            data-spans-container
            class="text-balance"
            @mouseup="select"
          ><span
            v-for="(span, index) in spansRef"
            data-span
            :key="index"
            :class="{ 'bg-slate-300': span.selected }"
            :style="{
              color: span.color,
            }"
            contenteditable="true"
            @input="(e) => input(e, index)"
          >{{ span.text }}</span></pre>
        </div>
      </div>
    </div>

    <pre class="p-4"><textarea
       class="w-full h-full text-balance"
       @input="changeSource()"
       v-model="sourceRef"
    ></textarea></pre>
  </div>
</template>
