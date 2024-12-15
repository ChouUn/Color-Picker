<script setup lang="ts">
import type { Span } from './TheMain.vue'

const spans = defineModel<Span[]>({ default: [], required: true })

console.log(spans)

const select = (index: number) => {
  const nextSpans = spans.value.map((span, i) => {
    if (i !== index) {
      return {
        ...span,
        selected: false,
      }
    }
    return {
      ...span,
      selected: !span.selected,
    }
  })
  spans.value = nextSpans
}
</script>

<template>
  <div>
    <pre contenteditable="true"><span
            :key="index"
            v-for="(span, index) in spans"
            :class="{ 'bg-slate-200': span.selected }"
            :style="{
              color: span.color,
              opacity: span.alpha,
            }"
            @click="select(index)"
        >{{ span.text }}</span></pre>
  </div>
</template>
