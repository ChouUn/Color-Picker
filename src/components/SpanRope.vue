<script setup lang="ts">
import { detectSelection, collapseSpans, type Span } from './SpanOps';

const spans = defineModel<Span[]>({ default: [], required: true })

const select = () => {
  // FIX: 当 selection 状态处于区间时，对单点进行点击，
  // mouseup 触发的瞬间，会仍然读到区间状态，与预期的点状态不符。
  // 所以这里使用 tricky 的方式，将检测延迟到下一个事件循环。
  setTimeout(() => {
    spans.value = collapseSpans(detectSelection(spans.value))
  }, 0.00);
}
</script>

<template>
  <div>
    <pre contenteditable="true" data-spans-container><span
      v-for="(span, index) in spans"
      data-span
      :key="index"
      :class="{ 'bg-slate-300': span.selected }"
      :style="{
        color: span.color,
        opacity: span.alpha,
      }"
      @mouseup="select"
    >{{ span.text }}</span></pre>
  </div>
</template>
