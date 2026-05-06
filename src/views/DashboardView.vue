<template>
  <div class="dashboard-page">
    <AppNavbar />

    <!-- ── HERO ── -->
    <section class="hero-dash">
      <img :src="heroImage" alt="Corredor de escuela" class="hero-bg" />
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <p class="hero-top-text">Visualiza el panorama nacional</p>
        <h1 class="hero-title">en nuestro dashboard</h1>
        <p class="hero-subtitle">
          Panel de control que centraliza información clave, indicadores y estado de los casos,<br/>
          facilitando el seguimiento y la gestión eficiente del sistema.
        </p>
      </div>
    </section>

    <!-- ── STAT CARDS ── -->
    <section class="py-8 bg-white">
      <div class="container-max">
        <div class="stats-grid-dash">
          <div
            v-for="(card, i) in statCards" :key="i"
            class="stat-card-custom"
            @mouseenter="card.hovered = true"
            @mouseleave="card.hovered = false"
            :class="{ hovered: card.hovered }"
          >
            <img :src="card.hovered ? card.white : card.pink" :alt="card.label" class="stat-img" />
            <div class="stat-label-dash">{{ card.label }}</div>
            <div class="stat-value-dash">{{ card.value }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── MAP + AGE CHART ── -->
    <section class="py-8">
      <div class="container-max">
        <div class="card-box unified-card">
          <div class="grid-2-col">
            <div class="map-container unified-left">
              <GuateMap />
            </div>
            <div class="age-container unified-right">
              <div class="age-chart-wrapper">
                <div v-for="item in ageData" :key="item.label" class="age-bar-row">
                  <span class="age-label">{{ item.label }}</span>
                  <div class="age-track">
                    <div class="age-fill" :style="{ width: ((item.value / maxAge) * 100) + '%' }"></div>
                  </div>
                  <span class="age-value">{{ item.value }}</span>
                </div>
                <div class="age-x-axis">
                  <span v-for="n in [0, 5, 10, 15]" :key="n">{{ n }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── CHART SECTION TITLE ── -->
    <section class="pb-2 text-center">
      <div class="container-max">
        <h2 class="chart-title">Graficas por Mes y Estado de Casos</h2>
        <p class="chart-subtitle">Muestra la distribución de casos por mes y estado, facilitando su análisis y seguimiento.</p>
      </div>
    </section>

    <!-- ── BAR CHART + DONUT CHART ── -->
    <section class="py-6 pb-12">
      <div class="container-max">
        <div class="grid-2-col gap-5">
          <div class="card-box chart-container">
            <LineChart />
          </div>
          <div class="card-box chart-container" style="overflow: hidden;">
            <DonaChart />
          </div>
        </div>
      </div>
    </section>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import AppNavbar  from '@/components/AppNavbar.vue'
import AppFooter  from '@/components/AppFooter.vue'
import GuateMap   from '@/components/GuateMap.vue'
import LineChart  from '@/components/LineChart.vue'
import DonaChart  from '@/components/DonaChart.vue'
import { useCasosStore } from '@/stores/casos'

import heroImage   from '@/assets/ninas embarazadas -37.webp'
import iconPink16  from '@/assets/ninas_embarazadas_-20.png'
import iconPink15  from '@/assets/ninas embarazadas -31.png'
import iconPink14  from '@/assets/ninas embarazadas -30.png'
import iconPink13  from '@/assets/ninas embarazadas -32.png'
import iconWhite16 from '@/assets/ninas_embarazadas_-13.png'
import iconWhite15 from '@/assets/ninas embarazadas -34.png'
import iconWhite14 from '@/assets/ninas embarazadas -35.png'
import iconWhite13 from '@/assets/ninas embarazadas -33.png'

const casosStore = useCasosStore()

// ── Stat Cards ─────────────────────────────────────────
const statCards = ref([
  { label: 'Total de Casos',            value: '1,000M', pink: iconPink16, white: iconWhite16, hovered: false },
  { label: 'Estudiantes Inactivos',     value: '500',    pink: iconPink14, white: iconWhite14, hovered: false },
  { label: 'Estudiantes Activos',       value: '500',    pink: iconPink15, white: iconWhite15, hovered: false },
  { label: 'Porcentaje de Estudiantes', value: '50%',    pink: iconPink13, white: iconWhite13, hovered: false }
])

// ── Age Bar Chart ──────────────────────────────────────
const ageDataRaw = [
  { label: '17 años',       value: casosStore.casosPorEdad(17).length || 14 },
  { label: 'Menores de 12', value: casosStore.casosPorEdad(12).length || 12 },
  { label: '16 años',       value: casosStore.casosPorEdad(16).length || 11 },
  { label: '15 años',       value: casosStore.casosPorEdad(15).length || 9  },
  { label: '14 años',       value: casosStore.casosPorEdad(14).length || 6  },
  { label: '13 años',       value: casosStore.casosPorEdad(13).length || 3  },
]

const ageData = computed(() => [...ageDataRaw].sort((a, b) => b.value - a.value))
const maxAge  = computed(() => { const m = Math.max(...ageData.value.map(d => d.value)); return m > 0 ? m : 15 })
</script>

<style scoped>
.dashboard-page {
  background-color: var(--sigec-bg-muted);
  color: var(--sigec-text);
  font-family: var(--sigec-font);
  min-height: 100vh;
}
.container-max { max-width: 60rem; margin: 0 auto; padding: 0 1.5rem; }
.bg-white  { background-color: var(--sigec-bg); }
.py-8      { padding-top: 2rem; padding-bottom: 2rem; }
.py-6      { padding-top: 1.5rem; padding-bottom: 1.5rem; }
.pb-12     { padding-bottom: 3rem; }
.pb-2      { padding-bottom: 0.5rem; }
.text-center { text-align: center; }
.gap-5     { gap: 1.25rem; }

/* STAT CARDS — Dashboard uses its own class names to avoid conflicts with global stat-card */
.stats-grid-dash { display: flex; gap: 1.5rem; }
.stat-card-custom {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 2.5rem 1rem 2rem; border-radius: 1rem; cursor: pointer;
  transition: all 0.2s; background-color: #f7f7f7;
}
.stat-card-custom.hovered { background-color: var(--sigec-primary); }
.stat-img   { width: 4rem; height: 4rem; object-fit: contain; margin-bottom: 1.25rem; }
.stat-label-dash { font-size: 0.875rem; font-weight: 700; margin-bottom: 0.5rem; text-align: center; color: var(--sigec-text-dark); }
.stat-card-custom.hovered .stat-label-dash { color: #ffffff; }
.stat-value-dash { color: var(--sigec-primary); font-size: 2.5rem; font-weight: 700; line-height: 1; }
.stat-card-custom.hovered .stat-value-dash { color: #ffffff; }

/* GRID & CARDS */
.grid-2-col { display: grid; grid-template-columns: 1fr 1fr; }
.card-box { background-color: var(--sigec-bg); border: none; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
.unified-card  { padding: 0; }
.unified-left  { padding: 1.5rem; }
.unified-right { padding: 2.5rem 1.5rem 1.5rem; }
.map-container { min-height: 280px; display: flex; align-items: center; justify-content: center; overflow: hidden; }

/* AGE CHART */
.age-container    { display: flex; flex-direction: column; justify-content: center; }
.age-chart-wrapper { display: flex; flex-direction: column; gap: 0.75rem; height: 100%; justify-content: center; }
.age-bar-row { display: flex; align-items: center; gap: 0.75rem; }
.age-label   { font-size: 0.75rem; width: 6rem; text-align: right; flex-shrink: 0; color: var(--sigec-text); }
.age-track   { flex: 1; height: 1rem; border-radius: 0.25rem; background-color: var(--sigec-border); overflow: hidden; }
.age-fill    { height: 100%; background-color: var(--sigec-primary); border-radius: 0.25rem; transition: width 0.5s ease; }
.age-value   { font-size: 0.75rem; width: 1rem; flex-shrink: 0; color: var(--sigec-text); }
.age-x-axis  { display: flex; justify-content: space-between; padding-left: 6.75rem; padding-right: 1.75rem; margin-top: 0.25rem; }
.age-x-axis span { font-size: 0.75rem; color: var(--sigec-text-muted); }

/* CHART TITLE */
.chart-title    { color: var(--sigec-text); font-size: 1.25rem; font-weight: 600; }
.chart-subtitle { margin-top: 0.25rem; font-size: 0.875rem; color: var(--sigec-primary); }

/* CHART WRAPPERS */
.chart-container { display: flex; align-items: center; justify-content: center; }
.chart-container > div { width: 100%; }
</style>