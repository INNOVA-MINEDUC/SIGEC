<template>
  <div class="landing-page">
    <AppNavbar />

    <!-- ── HERO ── -->
    <section class="hero">
      <img src="/imgs/img4.jpg" alt="Madre con recién nacido" class="hero-bg" />
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 class="hero-title">
          Sistema de registro<br />de casos de embarazos
        </h1>
        <p class="hero-subtitle">
          Registrar, consolidar y facilitar el reporte de información relacionada con casos de embarazo en niñas y
          adolescentes menores de 14 años, identificados dentro del
          <span class="font-bold">sistema educativo nacional.</span>
        </p>


      </div>
    </section>



    <!-- ── ABOUT SECTION ── -->
    <section class="about">
      <div class="about-container">
        <div class="about-text">
          <h2>
            ¿Qué es el sistema de registro de casos de embarazos?
          </h2>
 
          <p>
            El sistema de registro de casos de embarazos (SIRCE) es una plataforma web que permite el registro, la
            consulta y la consolidación de información relacionada con casos de embarazo en niñas y adolescentes menores
            de 14 años, identificados dentro del sistema educativo nacional. Su función es facilitar la disponibilidad
            de la información y la generación de reportes estadísticos.
          </p>
          <button class="primary-btn" @click="router.push('/seguimiento')">Seguimiento</button>
        </div>
        <div class="about-image">
          <img src="/imgs/escuela.png" alt="Niña embarazada" />
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


const router = useRouter()

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
  background: linear-gradient(to bottom,
      rgba(16, 35, 63, 0) 0%,
      rgba(16, 35, 63, 0.2) 40%,
      rgba(16, 35, 63, 0.95) 100%);
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
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
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
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  max-width: 700px;
}

.font-bold {
  font-weight: 600;
}

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

.institutions-container::-webkit-scrollbar {
  display: none;
}

.inst-item {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.generic-logo {
  height: 100px;
  width: auto;
  object-fit: contain;
  border-radius: 8px;
  padding: 4px;
}

.generic-logo1 {
  height: 60px;
  width: auto;
  object-fit: contain;
  border-radius: 8px;
  padding: 2px;
}

/* ABOUT */
.about {
  padding: 5rem 0;
  background-color: #f8f8f8;
}

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
  .about-container {
    flex-direction: row;
    justify-content: space-between;
  }
}

.about-text {
  flex: 1;
  max-width: 32rem;
}

.about-text h2 {
  color: #6d6d6d;
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1.5rem;
}

.about-text span {
  color: #10233f;
}

.about-text p {
  font-size: 1rem;
  line-height: 1.6;
  color: #6d6d6d;
  margin-bottom: 2rem;
}

.primary-btn {
  padding: 0.875rem 2.5rem;
  border-radius: 50px;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  background-color: #10233f;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 14px 0 rgb(23, 196, 232);
}

.primary-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.about-image {
  flex-shrink: 0;
  width: 100%;
  max-width: 520px;
}

.about-image img {
  width: 100%;
  height: 380px;
  object-fit: cover;
  border-radius: 1.5rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
}

/* STATS */
.stats {
  padding: 5rem 0;
  background-color: white;
}

.stats-container {
  max-width: 75rem;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
  }
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

.stat-card:hover {
  background-color: #ff9797;
  transform: translateY(-4px);
  box-shadow: 0 10px 20px -5px rgba(255, 151, 151, 0.4);
}

.stat-icon-wrapper {
  margin-bottom: 1.5rem;
}

.stat-icon {
  width: 4.5rem;
  height: 4.5rem;
  object-fit: contain;
}

.stat-card .white-icon {
  display: none;
}

.stat-card:hover .pink-icon {
  display: none;
}

.stat-card:hover .white-icon {
  display: block;
}

.stat-label {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-align: center;
  color: #1a1a1a;
  transition: color 0.2s;
}

.stat-card:hover .stat-label {
  color: #ffffff;
}

.stat-value {
  color: #ff9797;
  font-size: 48px;
  font-weight: 800;
  line-height: 1;
  transition: color 0.2s;
}

.stat-card:hover .stat-value {
  color: #ffffff;
}

/* SCHOOL IMAGE */
.school-img {
  height: 350px;
  padding: 0 10rem;
}

.school-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-bottom: 10px solid #17c4e8;
}

/* SEARCH SECTION */
.search-section {
  padding: 0 0 5rem 0;
  background-color: white;
}

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
  background-color: #cccc;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
}

@media (min-width: 768px) {
  .search-container {
    flex-direction: row;
    justify-content: space-between;
    text-align: left;
  }

  .search-box {
    width: auto;
  }
}

.search-text h3 {
  font-size: 32px;
  font-weight: 700;
  color: #10233f;
  margin-bottom: 0.5rem;
}

.search-text p {
  color: #10233f;
  font-size: 1.125rem;
  font-weight: 600;
  margin-top: 0;
}

.search-box {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}

.search-btn {
  padding: 1rem 3rem;
  font-size: 1.125rem;
}
</style>
