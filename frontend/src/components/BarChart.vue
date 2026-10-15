<template>
  <div class="chart-casos">
    <div class="chart-header">
      <span class="chart-title">Casos por edad</span>
      <span class="chart-total">{{ total }} {{ total === 1 ? 'caso' : 'casos' }}</span>
    </div>

    <div class="chart-rows">
      <div
        v-for="item in data"
        :key="item.edad"
        class="chart-row"
      >
        <div class="chart-label">{{ item.edad }}</div>

        <div class="chart-track">
          <div
            class="chart-bar"
            :style="{ width: barWidth(item.value) + '%' }"
          ></div>
          <span class="chart-value" :class="{ 'chart-value-zero': item.value === 0 }">{{ item.value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue"
import { useCasosStore } from '@/stores/casos'
import { contarPorEdad } from '@/helpers/estadisticasCasos'

const casosStore = useCasosStore()

// Rangos de 14 (arriba) a <9 (abajo); los mismos que usa el PDF. Los casos
// sin edad registrada no se cuentan en ningún rango.
const data = computed(() =>
  contarPorEdad(casosStore.casos).map(r => ({ edad: r.label, value: r.total }))
)

const total = computed(() => data.value.reduce((sum, d) => sum + d.value, 0))

// 25% de margen extra para que la barra más alta no toque el borde
const maxValue = computed(() => {
  const max = Math.max(...data.value.map(d => d.value), 0)
  return max === 0 ? 1 : max * 1.25
})

const barWidth = (value) => {
  if (value <= 0) return 1.2 // barra mínima visible
  return Math.min((value / maxValue.value) * 100, 100)
}
</script>

<style scoped>
.chart-casos {
  width: 100%;
  height: 400px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.chart-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 18px;
}

.chart-title {
  font-size: 15px;
  font-weight: 700;
  color: #10233f;
}

.chart-total {
  font-size: 12px;
  font-weight: 600;
  color: #8a93a3;
}

.chart-rows {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.chart-row {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 20px;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.chart-row:hover {
  background-color: rgba(16, 35, 63, 0.05);
}

.chart-label {
  width: 56px;
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  color: #10233f;
  text-align: right;
}

.chart-track {
  position: relative;
  flex: 1;
  height: 20px;
  display: flex;
  align-items: center;
  background-image: repeating-linear-gradient(
    to right,
    rgba(16, 35, 63, 0.1) 0,
    rgba(16, 35, 63, 0.1) 1px,
    transparent 1px,
    transparent 16.6%
  );
}

.chart-bar {
  height: 18px;
  min-width: 5px;
  background: linear-gradient(to right, #10233f, #1f3864);
  border-radius: 0 7px 7px 0;
  box-shadow: 0 1px 3px rgba(16, 35, 63, 0.3);
  transition: width 0.8s ease;
}

.chart-value {
  margin-left: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #10233f;
  white-space: nowrap;
  flex-shrink: 0;
}

.chart-value-zero {
  color: #b0b0b0;
  font-weight: 500;
}
</style>
