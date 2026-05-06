<template>
  <div class="landing-page">
    <AppNavbar />

    <!-- ── HERO ── -->
    <section class="hero">
      <img src="@/assets/ninas_embarazadas_-07.webp" alt="Madre con recién nacido" class="hero-bg" loading="lazy" />
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
          <img src="@/assets/ninas_embarazadas_-10.webp" alt="Niña embarazada" loading="lazy" />
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
      <img src="@/assets/ninas_embarazadas_-12.webp" alt="Aula escolar" loading="lazy" />
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
import { useStatCards } from '@/composables/useStatCards'

import logoMineduc  from '@/assets/logo_mineduc.png'
import logoDigikal  from '@/assets/logo_digikal.png'
import logoDigecade from '@/assets/logo_digecade.png'

const router = useRouter()
const { statCards } = useStatCards()
</script>

<style scoped>
.landing-page {
  background-color: var(--sigec-bg);
  color: var(--sigec-text);
  font-family: var(--sigec-font);
  min-height: 100vh;
}

/* HERO — override: HomeView usa 48px en vez de 64px global */
.hero-title { font-size: 48px; max-width: 800px; }

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
.about { padding: 5rem 0; background-color: var(--sigec-bg-soft); }
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
.about-text h2 { color: var(--sigec-text); font-size: 32px; font-weight: 700; line-height: 1.2; margin-bottom: 1.5rem; }
.about-text span { color: var(--sigec-primary); }
.about-text p { font-size: 1rem; line-height: 1.6; color: var(--sigec-text); margin-bottom: 2rem; }
.primary-btn {
  padding: 0.875rem 2.5rem;
  border-radius: 50px;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  background-color: var(--sigec-primary);
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

/* SCHOOL IMAGE */
.school-img { height: 350px; padding: 0 10rem; }
.school-img img { width: 100%; height: 100%; object-fit: cover; object-position: center; border-bottom: 10px solid var(--sigec-primary); }

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
.search-text h3 { font-size: 32px; font-weight: 700; color: var(--sigec-text); margin-bottom: 0.5rem; }
.search-text p  { color: var(--sigec-primary); font-size: 1.125rem; font-weight: 600; margin-top: 0; }
.search-box { display: flex; justify-content: flex-end; width: 100%; }
.search-btn { padding: 1rem 3rem; font-size: 1.125rem; }
</style>
