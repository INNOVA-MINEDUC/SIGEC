<template>
  <div class="landing-page dashboard-page">
    <!-- ── NAVBAR ── -->
    <nav class="navbar">
      <div class="nav-container">
        <!-- Logo -->
        <div class="logo-container">
          <img :src="logoSisec" alt="Logo SIGEC" class="header-logo-img" />
        </div>

        <!-- Links -->
        <div class="nav-links">
          <router-link v-for="link in navLinks" :key="link.name" :to="link.to" class="nav-item" active-class="nav-item-active" :exact="link.to === '/'">
            {{ link.name }}
          </router-link>
          
          <div class="divider"></div>
          
          <router-link to="/profile" class="nav-btn account-btn">
            <v-icon size="15" class="mr-1">mdi-account</v-icon>
            Mi Cuenta
          </router-link>
          
          <button class="nav-btn logout-btn" @click="logout">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>

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
            class="stat-card-custom" 
            v-for="(card, index) in statCards" 
            :key="index"
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
            <!-- Left: Map -->
            <div class="map-container unified-left">
              <GuateMap />
            </div>

            <!-- Right: Horizontal Age Bars -->
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
          <!-- Left: Monthly Bar Chart -->
          <div class="card-box chart-container">
             <LineChart />
          </div>

          <!-- Right: Donut Chart -->
          <div class="card-box chart-container" style="overflow: hidden;">
             <DonaChart />
          </div>
        </div>
      </div>
    </section>

    <!-- ── FOOTER ── -->
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-logo">
          <img :src="logoDigecade1" alt="Logo DCE" class="footer-logo-img" />
        </div>

        <div class="footer-grid">
          <!-- Col 1 -->
          <div>
            <div class="footer-title">DIGECADE</div>
            <div class="footer-list">
              <div class="footer-item"><v-icon size="16">mdi-map-marker-outline</v-icon> <span>6a. Calle 1-87, Zona 10, Ciudad de Guatemala</span></div>
              <div class="footer-item"><v-icon size="16">mdi-phone-outline</v-icon> <span>PBX +502 2411-9595</span></div>
              <div class="footer-item"><v-icon size="16">mdi-email-outline</v-icon> <span>cegarcia@mineduc.gob.gt<br />edu.mineduc.gob.gt/DIGECADE</span></div>
            </div>
          </div>

          <!-- Col 2 -->
          <div>
            <div class="footer-title">SUBDIRECCION / CONTACTOS</div>
            <div class="footer-list">
              <div class="footer-item"><v-icon size="16">mdi-account-outline</v-icon> <span>Directora: Claudia E. Morales García (correo público)</span></div>
              <div class="footer-item"><v-icon size="16">mdi-phone-outline</v-icon> <span>Extensiones internas (ver directorio oficial)</span></div>
              <div class="footer-item"><v-icon size="16">mdi-web</v-icon> <span>Directorio oficial: documentos públicos del<br />MINEDUC</span></div>
            </div>
          </div>

          <!-- Col 3 -->
          <div>
            <div class="footer-title">SUBDIRECCION / CONTACTOS</div>
            <div class="footer-list">
              <div class="footer-item"><v-icon size="16">mdi-lightbulb-on-outline</v-icon> <span>Centro de Capacitación Tecnológica - INNOVA</span></div>
              <div class="footer-item"><v-icon size="16">mdi-web</v-icon> <span>cctmineduc.blogspot.com</span></div>
              <div class="footer-item"><v-icon size="16">mdi-message-processing-outline</v-icon> <span>(contacto via DIGECADE / MINEDUC;<br />ver página oficial para correos específicos)</span></div>
              <div class="footer-item mt-4"><v-icon size="16">mdi-circle-medium</v-icon> <span>Información pública tomada del sitio y directorio<br />oficial del Ministerio de Educación de Guatemala.</span></div>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          @ 2023 ByteSpace. All rights reserved.
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCasosStore } from '@/stores/casos'

import GuateMap from "@/components/GuateMap.vue"
import LineChart from "@/components/LineChart.vue"
import DonaChart from "@/components/DonaChart.vue"

// Logos & Images
import logoDigecade1 from '@/assets/LOGOS_DCE1.png'
import logoSisec from '@/assets/LOGO_SISEC.png'

import heroImage from '@/assets/ninas embarazadas -37.png'

// Stat icons (Pink)
import iconPink16 from '@/assets/ninas_embarazadas_-20.png'
import iconPink15 from '@/assets/ninas embarazadas -31.png'
import iconPink14 from '@/assets/ninas embarazadas -30.png'
import iconPink13 from '@/assets/ninas embarazadas -32.png'

// Stat icons (White)
import iconWhite16 from '@/assets/ninas_embarazadas_-13.png'
import iconWhite15 from '@/assets/ninas embarazadas -34.png'
import iconWhite14 from '@/assets/ninas embarazadas -35.png'
import iconWhite13 from '@/assets/ninas embarazadas -33.png'


const router = useRouter()
const auth = useAuthStore()
const casosStore = useCasosStore()

const navLinks = [
  { name: 'Inicio', to: '/' },
  { name: 'Seguimiento', to: '/seguimiento' },
  { name: 'Quejas', to: '/complains' },
  { name: 'Dashboard', to: '/dashboard' },
  { name: 'Importar Datos', to: '/charge-data' },
  { name: 'Usuarios', to: '/users' }
]

function logout() {
  auth.logout()
  router.push('/login')
}

// Stat Cards Logic
const statCards = ref([
  { label: 'Total de Casos',            value: '1,000M', pink: iconPink16, white: iconWhite16, hovered: false },
  { label: 'Estudiantes Inactivos',     value: '500',    pink: iconPink14, white: iconWhite14, hovered: false },
  { label: 'Estudiantes Activos',       value: '500',    pink: iconPink15, white: iconWhite15, hovered: false },
  { label: 'porcentage de estudiantes', value: '50%',    pink: iconPink13, white: iconWhite13, hovered: false }
])

// Age Bar Logic
const ageDataRaw = [
  { label: "17 años",       value: casosStore.casosPorEdad(17).length || 14 },
  { label: "Menores de 12", value: casosStore.casosPorEdad(12).length || 12 },
  { label: "16 años",       value: casosStore.casosPorEdad(16).length || 11 },
  { label: "15 años",       value: casosStore.casosPorEdad(15).length || 9 },
  { label: "14 años",       value: casosStore.casosPorEdad(14).length || 6 },
  { label: "13 años",       value: casosStore.casosPorEdad(13).length || 3 },
]

const ageData = computed(() => {
  return [...ageDataRaw].sort((a,b) => b.value - a.value)
})

const maxAge = computed(() => {
  const max = Math.max(...ageData.value.map(d => d.value))
  return max > 0 ? max : 15
})

</script>

<style scoped>
/* BASE STYLES */
.landing-page {
  background-color: #f5f5f5;
  color: #6d6d6d;
  font-family: system-ui, -apple-system, sans-serif;
  min-height: 100vh;
}
.container-max {
  max-width: 60rem;
  margin: 0 auto;
  padding: 0 1.5rem;
}
.bg-white { background-color: #ffffff; }
.py-8 { padding-top: 2rem; padding-bottom: 2rem; }
.py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
.pb-12 { padding-bottom: 3rem; }
.pb-2 { padding-bottom: 0.5rem; }
.text-center { text-align: center; }
.gap-5 { gap: 1.25rem; }

/* NAVBAR */
.navbar {
  position: sticky;
  top: 0;
  z-index: 50;
  background-color: white;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
.nav-container {
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.logo-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.header-logo-img {
  height: 44px;
  width: auto;
  object-fit: contain;
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.nav-item {
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
  font-size: 0.875rem;
  color: #6d6d6d;
  text-decoration: none;
  border-bottom: 2px solid transparent;
}
.nav-item-active {
  color: #ff9797;
  border-bottom-color: #ff9797;
  font-weight: 600;
}
.divider {
  width: 1px;
  height: 1.25rem;
  background-color: #e5e7eb;
  margin: 0 0.25rem;
}
.nav-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  border-radius: 0.25rem;
  color: #6d6d6d;
  text-decoration: none;
}
.logout-btn {
  background-color: #ff9797;
  color: white;
  margin-left: 0.25rem;
  padding: 0.375rem 1rem;
  transition: opacity 0.2s;
}
.logout-btn:hover {
  opacity: 0.9;
}

/* HERO */
.hero-dash {
  position: relative;
  width: 100%;
  overflow: hidden;
  height: 500px;
}
.hero-bg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(255,151,151,0) 0%, rgba(255,151,151,0.2) 40%, rgba(255,151,151,0.95) 100%);
}
.hero-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 3.5rem;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  text-align: center;
}
.hero-top-text {
  color: white;
  font-size: 32px;
  font-weight: 700;
  text-shadow: 0 4px 10px rgba(0,0,0,0.3);
  margin-bottom: -0.25rem;
  line-height: 1.1;
}
.hero-title {
  color: white;
  text-shadow: 0 4px 12px rgba(0,0,0,0.3);
  font-size: 64px;
  font-weight: 700;
  line-height: 1.15;
  max-width: 900px;
  margin-bottom: 0;
}
.hero-subtitle {
  margin-top: 1rem;
  color: white;
  font-size: 1.125rem;
  font-weight: 500;
  text-shadow: 0 2px 8px rgba(0,0,0,0.3);
  max-width: 700px;
  opacity: 1;
}

/* STAT CARDS */
.stats-grid {
  display: flex;
  gap: 1.5rem;
}
.stat-card-custom {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1rem 2rem;
  border-radius: 1rem;
  box-shadow: none;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #f7f7f7;
  border: none;
}
.stat-card-custom.hovered {
  background-color: #ff9797;
}
.stat-img {
  width: 4rem;
  height: 4rem;
  object-fit: contain;
  margin-bottom: 1.25rem;
}
.stat-label {
  font-size: 0.875rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-align: center;
  color: #1a1a1a;
}
.stat-card-custom.hovered .stat-label {
  color: #ffffff;
}
.stat-value {
  color: #ff9797;
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
}
.stat-card-custom.hovered .stat-value {
  color: #ffffff;
}

/* GRIDS & CARDS */
.grid-2-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.card-box {
  background-color: #ffffff;
  border: none;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}
.unified-card {
  padding: 0; /* Let inner content pad so we can do full-height border */
}
.unified-left {
  padding: 1.5rem;
}
.unified-right {
  padding: 2.5rem 1.5rem 1.5rem 1.5rem;
}
.map-container {
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* AGE CHART */
.age-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.age-chart-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  height: 100%;
  justify-content: center;
}
.age-bar-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.age-label {
  font-size: 0.75rem;
  width: 6rem;
  text-align: right;
  flex-shrink: 0;
  color: #6d6d6d;
}
.age-track {
  flex: 1;
  height: 1rem;
  border-radius: 0.25rem;
  background-color: #f0f0f0;
  overflow: hidden;
}
.age-fill {
  height: 100%;
  background-color: #ff9797;
  border-radius: 0.25rem;
  transition: width 0.5s ease;
}
.age-value {
  font-size: 0.75rem;
  width: 1rem;
  flex-shrink: 0;
  color: #6d6d6d;
}
.age-x-axis {
  display: flex;
  justify-content: space-between;
  padding-left: 6.75rem;
  padding-right: 1.75rem;
  margin-top: 0.25rem;
}
.age-x-axis span {
  font-size: 0.75rem;
  color: #b0b0b0;
}

/* CHARTS TITLE */
.chart-title {
  color: #6d6d6d;
  font-size: 1.25rem;
  font-weight: 600;
}
.chart-subtitle {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #ff9797;
}

/* CHARTS WRAPPERS */
.chart-container {
  display: flex;
  align-items: center;
  justify-content: center;
}
.chart-container > div {
  width: 100%;
}

/* FOOTER */
.footer {
  background-color: #ff9797;
  color: white;
  padding: 1rem 0 1.5rem;
}
.footer-container {
  max-width: 75rem;
  margin: 0 auto;
  padding: 0 1.5rem;
  position: relative;
}
.footer-logo {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 3rem;
  padding-top: 3rem;
}
.footer-logo-img {
  height: 48px;
  width: auto;
  object-fit: contain;
}
.footer-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
  align-items: start;
}
@media (min-width: 768px) {
  .footer-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 3rem;
  }
}
.footer-title {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 1rem;
}
.footer-list {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  font-size: 0.75rem;
  line-height: 1.4;
  font-weight: 400;
}
.footer-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}
.footer-item .v-icon {
  margin-top: 0.125rem;
  opacity: 1;
}
.footer-item span {
  opacity: 0.95;
}
.footer-bottom {
  margin-top: 2rem;
  padding-top: 1rem;
  text-align: right;
  font-size: 0.75rem;
  opacity: 0.8;
  border-top: 1px solid #ffffff;
}
</style>