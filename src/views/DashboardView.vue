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
        <div class="stats-grid">
          <div
            v-for="(card, i) in statCards" :key="i"
            class="stat-card-custom"
            @mouseenter="card.hovered = true"
            @mouseleave="card.hovered = false"
            :class="{ hovered: card.hovered }"
          >
            <img :src="card.hovered ? card.white : card.pink" :alt="card.label" class="stat-img" />
            <div class="stat-label">{{ card.label }}</div>
            <div class="stat-value">{{ card.value }}</div>
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

import heroImage   from '@/assets/ninas embarazadas -37.png'
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
  background-color: #f5f5f5;
  color: #6d6d6d;
  font-family: system-ui, -apple-system, sans-serif;
  min-height: 100vh;
}
.container-max { max-width: 60rem; margin: 0 auto; padding: 0 1.5rem; }
.bg-white  { background-color: #ffffff; }
.py-8      { padding-top: 2rem; padding-bottom: 2rem; }
.py-6      { padding-top: 1.5rem; padding-bottom: 1.5rem; }
.pb-12     { padding-bottom: 3rem; }
.pb-2      { padding-bottom: 0.5rem; }
.text-center { text-align: center; }
.gap-5     { gap: 1.25rem; }

/* HERO */
.hero-dash { position: relative; width: 100%; overflow: hidden; height: 500px; }
.hero-bg   { width: 100%; height: 100%; object-fit: cover; object-position: center; }
.hero-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, rgba(255,151,151,0) 0%, rgba(255,151,151,0.2) 40%, rgba(255,151,151,0.95) 100%);
}
.hero-content {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
  padding-bottom: 3.5rem; padding-inline: 1.5rem; text-align: center;
}
.hero-top-text { color: white; font-size: 32px; font-weight: 700; text-shadow: 0 4px 10px rgba(0,0,0,0.3); margin-bottom: -0.25rem; line-height: 1.1; }
.hero-title    { color: white; text-shadow: 0 4px 12px rgba(0,0,0,0.3); font-size: 64px; font-weight: 700; line-height: 1.15; max-width: 900px; margin-bottom: 0; }
.hero-subtitle { margin-top: 1rem; color: white; font-size: 1.125rem; font-weight: 500; text-shadow: 0 2px 8px rgba(0,0,0,0.3); max-width: 700px; }

/* STAT CARDS */
.stats-grid { display: flex; gap: 1.5rem; }
.stat-card-custom {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 2.5rem 1rem 2rem; border-radius: 1rem; cursor: pointer;
  transition: all 0.2s; background-color: #f7f7f7;
}
.stat-card-custom.hovered { background-color: #ff9797; }
.stat-img   { width: 4rem; height: 4rem; object-fit: contain; margin-bottom: 1.25rem; }
.stat-label { font-size: 0.875rem; font-weight: 700; margin-bottom: 0.5rem; text-align: center; color: #1a1a1a; }
.stat-card-custom.hovered .stat-label { color: #ffffff; }
.stat-value { color: #ff9797; font-size: 2.5rem; font-weight: 700; line-height: 1; }
.stat-card-custom.hovered .stat-value { color: #ffffff; }

/* GRID & CARDS */
.grid-2-col { display: grid; grid-template-columns: 1fr 1fr; }
.card-box { background-color: #ffffff; border: none; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
.unified-card  { padding: 0; }
.unified-left  { padding: 1.5rem; }
.unified-right { padding: 2.5rem 1.5rem 1.5rem; }
.map-container { min-height: 280px; display: flex; align-items: center; justify-content: center; overflow: hidden; }

/* AGE CHART */
.age-container    { display: flex; flex-direction: column; justify-content: center; }
.age-chart-wrapper { display: flex; flex-direction: column; gap: 0.75rem; height: 100%; justify-content: center; }
.age-bar-row { display: flex; align-items: center; gap: 0.75rem; }
.age-label   { font-size: 0.75rem; width: 6rem; text-align: right; flex-shrink: 0; color: #6d6d6d; }
.age-track   { flex: 1; height: 1rem; border-radius: 0.25rem; background-color: #f0f0f0; overflow: hidden; }
.age-fill    { height: 100%; background-color: #ff9797; border-radius: 0.25rem; transition: width 0.5s ease; }
.age-value   { font-size: 0.75rem; width: 1rem; flex-shrink: 0; color: #6d6d6d; }
.age-x-axis  { display: flex; justify-content: space-between; padding-left: 6.75rem; padding-right: 1.75rem; margin-top: 0.25rem; }
.age-x-axis span { font-size: 0.75rem; color: #b0b0b0; }

/* CHART TITLE */
.chart-title    { color: #6d6d6d; font-size: 1.25rem; font-weight: 600; }
.chart-subtitle { margin-top: 0.25rem; font-size: 0.875rem; color: #ff9797; }

/* CHART WRAPPERS */
.chart-container { display: flex; align-items: center; justify-content: center; }
.chart-container > div { width: 100%; }
</style>