<template>
  <div class="landing-page">
    <AppNavbar />

    <!-- ── HERO ── -->
    <section class="hero">
      <img src="@/assets/ninas_embarazadas_-07.png" alt="Madre con recién nacido" class="hero-bg" />
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 class="hero-title">
          Sistema Integral de Gestión<br />de Embarazos y Casos
        </h1>
        <p class="hero-subtitle">
          Seguimiento individual de cada caso, asegurando atención continua a
          <span class="font-bold">Niñas Embarazadas</span> a nivel nacional.
        </p>
      </div>
    </section>

    <!-- ── INSTITUTION LOGOS ── -->
    <section class="institutions">
      <div class="institutions-container">
        <div class="inst-item">
          <img :src="logoMineduc" alt="Logo MINEDUC" class="generic-logo" />
        </div>
        <div class="inst-item">
          <img :src="logoDigikal" alt="Logo DIGIKAL" class="generic-logo" />
        </div>
        <div class="inst-item">
          <img :src="logoDigecade" alt="Logo DIGECADE" class="generic-logo1" />
        </div>
      </div>
    </section>

    <!-- ── ABOUT SECTION ── -->
    <section class="about">
      <div class="about-container">
        <div class="about-text">
          <h2>
            ¿Qué es el Sistema Integral de Gestión de
            <span>Embarazos y Casos?</span>
          </h2>
          <p>
            El Sistema Integral de Gestión de Embarazos y Casos (SIGEC) es una plataforma web del Estado que permite
            el registro, consulta y seguimiento de casos de niñas y adolescentes embarazadas. Su función es facilitar
            la coordinación institucional y apoyar la toma de decisiones, garantizando el acceso oportuno a servicios
            de salud, educación y apoyo social.
          </p>
          <button class="primary-btn" @click="router.push('/login')">Iniciar Sesión</button>
        </div>
        <div class="about-image">
          <img src="@/assets/ninas_embarazadas_-10.png" alt="Niña embarazada" />
        </div>
      </div>
    </section>

    <!-- ── STATS SECTION ── -->
    <section class="stats">
      <div class="stats-container">
        <div class="stats-grid">
          <div class="stat-card" v-for="card in statCards" :key="card.label">
            <div class="stat-icon-wrapper">
              <img :src="card.pink"  alt="Icon" class="stat-icon pink-icon" />
              <img :src="card.white" alt="Icon" class="stat-icon white-icon" />
            </div>
            <div class="stat-label">{{ card.label }}</div>
            <div class="stat-value">{{ card.value }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── SCHOOL IMAGE ── -->
    <section class="school-img">
      <img src="@/assets/ninas_embarazadas_-12.png" alt="Aula escolar" />
    </section>

    <!-- ── SEARCH SECTION ── -->
    <section class="search-section">
      <div class="search-container">
        <div class="search-text">
          <h3>Buscar por ID, nombre o escuela...</h3>
          <p>Permite localizar casos por ID, nombre o centro educativo de forma rápida y segura.</p>
        </div>
        <div class="search-box">
          <button class="primary-btn search-btn">Seguimiento</button>
        </div>
      </div>
    </section>

    <AppFooter />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'

import logoMineduc  from '@/assets/logo_mineduc.png'
import logoDigikal  from '@/assets/logo_digikal.png'
import logoDigecade from '@/assets/logo_digecade.png'

import iconFootprintsPink  from '@/assets/ninas_embarazadas_-20.png'
import iconFootprintsWhite from '@/assets/ninas_embarazadas_-13.png'
import iconClipboardPink   from '@/assets/ninas_embarazadas_-19.png'
import iconClipboardWhite  from '@/assets/ninas_embarazadas_-14.png'
import iconGraduationPink  from '@/assets/ninas_embarazadas_-18.png'
import iconGraduationWhite from '@/assets/ninas_embarazadas_-15.png'
import iconBuildingPink    from '@/assets/ninas_embarazadas_-17.png'
import iconBuildingWhite   from '@/assets/ninas_embarazadas_-16.png'

const router = useRouter()

const statCards = [
  { label: 'Casos totales',     value: '17', pink: iconFootprintsPink,  white: iconFootprintsWhite },
  { label: 'En seguimiento',    value: '06', pink: iconClipboardPink,   white: iconClipboardWhite },
  { label: 'Aún estudiando',    value: '06', pink: iconGraduationPink,  white: iconGraduationWhite },
  { label: 'Fuera del sistema', value: '05', pink: iconBuildingPink,    white: iconBuildingWhite }
]
</script>

<style scoped>
.landing-page {
  background-color: #ffffff;
  color: #6d6d6d;
  font-family: system-ui, -apple-system, sans-serif;
  min-height: 100vh;
}

/* HERO */
.hero {
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
  padding-inline: 1.5rem;
  text-align: center;
}
.hero-title {
  color: white;
  text-shadow: 0 4px 12px rgba(0,0,0,0.3);
  font-size: 48px;
  font-weight: 700;
  line-height: 1.15;
  max-width: 800px;
  margin-bottom: 0;
}
.hero-subtitle {
  margin-top: 1rem;
  color: white;
  font-size: 1.125rem;
  font-weight: 500;
  text-shadow: 0 2px 8px rgba(0,0,0,0.3);
  max-width: 700px;
}
.font-bold { font-weight: 600; }

/* INSTITUTIONS */
.institutions {
  padding: 2rem 0;
  background-color: white;
  border-bottom: 1px solid #f3f4f6;
}
.institutions-container {
  max-width: 75rem;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3rem;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.institutions-container::-webkit-scrollbar { display: none; }
.inst-item {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.generic-logo  { height: 100px; width: auto; object-fit: contain; border-radius: 8px; padding: 4px; }
.generic-logo1 { height: 60px;  width: auto; object-fit: contain; border-radius: 8px; padding: 2px; }

/* ABOUT */
.about { padding: 5rem 0; background-color: #f8f8f8; }
.about-container {
  max-width: 75rem;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rem;
}
@media (min-width: 768px) {
  .about-container { flex-direction: row; justify-content: space-between; }
}
.about-text { flex: 1; max-width: 32rem; }
.about-text h2 { color: #6d6d6d; font-size: 32px; font-weight: 700; line-height: 1.2; margin-bottom: 1.5rem; }
.about-text span { color: #ff9797; }
.about-text p { font-size: 1rem; line-height: 1.6; color: #6d6d6d; margin-bottom: 2rem; }
.primary-btn {
  padding: 0.875rem 2.5rem;
  border-radius: 50px;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  background-color: #ff9797;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 14px 0 rgba(255, 151, 151, 0.39);
}
.primary-btn:hover { opacity: 0.9; transform: translateY(-1px); }
.about-image { flex-shrink: 0; width: 100%; max-width: 520px; }
.about-image img { width: 100%; height: 380px; object-fit: cover; border-radius: 1.5rem; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }

/* STATS */
.stats { padding: 5rem 0; background-color: white; }
.stats-container { max-width: 75rem; margin: 0 auto; padding: 0 1.5rem; }
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}
@media (min-width: 768px) {
  .stats-grid { grid-template-columns: repeat(4, 1fr); gap: 2rem; }
}
.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  border-radius: 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  background-color: #f8f8f8;
}
.stat-card:hover { background-color: #ff9797; transform: translateY(-4px); box-shadow: 0 10px 20px -5px rgba(255,151,151,0.4); }
.stat-icon-wrapper { margin-bottom: 1.5rem; }
.stat-icon { width: 4.5rem; height: 4.5rem; object-fit: contain; }
.stat-card .white-icon         { display: none; }
.stat-card:hover .pink-icon    { display: none; }
.stat-card:hover .white-icon   { display: block; }
.stat-label { font-size: 1.125rem; font-weight: 700; margin-bottom: 0.5rem; text-align: center; color: #1a1a1a; transition: color 0.2s; }
.stat-card:hover .stat-label   { color: #ffffff; }
.stat-value { color: #ff9797; font-size: 48px; font-weight: 800; line-height: 1; transition: color 0.2s; }
.stat-card:hover .stat-value   { color: #ffffff; }

/* SCHOOL IMAGE */
.school-img { height: 350px; padding: 0 10rem; }
.school-img img { width: 100%; height: 100%; object-fit: cover; object-position: center; border-bottom: 10px solid #ff9797; }

/* SEARCH SECTION */
.search-section { padding: 0 0 5rem 0; background-color: white; }
.search-container {
  max-width: 75rem;
  height: 10rem;
  margin: 0 auto;
  padding: 0 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  text-align: center;
  background-color: #ebebeb70;
}
@media (min-width: 768px) {
  .search-container { flex-direction: row; justify-content: space-between; text-align: left; }
  .search-box { width: auto; }
}
.search-text h3 { font-size: 32px; font-weight: 700; color: #6d6d6d; margin-bottom: 0.5rem; }
.search-text p  { color: #ff9797; font-size: 1.125rem; font-weight: 600; margin-top: 0; }
.search-box { display: flex; justify-content: flex-end; width: 100%; }
.search-btn { padding: 1rem 3rem; font-size: 1.125rem; }
</style>
