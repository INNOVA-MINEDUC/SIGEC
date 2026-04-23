<template>
  <div class="landing-page">
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
        <!-- Logo 1 -->
        <div class="inst-item">
          <img :src="logoMineduc" alt="Logo Institución 1" class="generic-logo" />
        </div>

         <div class="inst-item">
          <img :src="logoDigikal" alt="Logo Institución 1" class="generic-logo" />
        </div>

         <div class="inst-item">
          <img :src="logoDigecade" alt="Logo Institución 1" class="generic-logo1" />
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
          <button class="primary-btn" @click="goToLogin">
            Iniciar Sesión
          </button>
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
              <img :src="card.pink" alt="Icon" class="stat-icon pink-icon" />
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

    <!-- ── FOOTER ── -->
    <footer class="footer">
      <div class="footer-container">
        <!-- Logo DGCE at top left -->
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Icons
import iconFootprintsPink from '@/assets/ninas_embarazadas_-20.png'
import iconFootprintsWhite from '@/assets/ninas_embarazadas_-13.png'
import iconClipboardPink from '@/assets/ninas_embarazadas_-19.png'
import iconClipboardWhite from '@/assets/ninas_embarazadas_-14.png'
import iconGraduationPink from '@/assets/ninas_embarazadas_-18.png'
import iconGraduationWhite from '@/assets/ninas_embarazadas_-15.png'
import iconBuildingPink from '@/assets/ninas_embarazadas_-17.png'
import iconBuildingWhite from '@/assets/ninas_embarazadas_-16.png'

import logoMineduc from '@/assets/Portada Niñas Embarazadas -41.png'
import logoDigikal from '@/assets/Portada Niñas Embarazadas -42.png'
import logoDigecade from '@/assets/Portada Niñas Embarazadas -43.png'
import logoDigecade1 from '@/assets/LOGOS_DCE1.png'
import logoSisec from '@/assets/LOGO_SISEC.png'

const router = useRouter()
const auth = useAuthStore()
const searchQuery = ref('')

const navLinks = [
  { name: 'Inicio', to: '/' },
  { name: 'Seguimiento', to: '/seguimiento' },
  { name: 'Quejas', to: '/complains' },
  { name: 'Dashboard', to: '/dashboard' },
  { name: 'Importar Datos', to: '/charge-data' },
  { name: 'Usuarios', to: '/users' }
]

const statCards = [
  { label: 'Casos totales', value: '17', pink: iconFootprintsPink, white: iconFootprintsWhite },
  { label: 'En seguimiento', value: '06', pink: iconClipboardPink, white: iconClipboardWhite },
  { label: 'Aún estudiando', value: '06', pink: iconGraduationPink, white: iconGraduationWhite },
  { label: 'Fuera del sistema', value: '05', pink: iconBuildingPink, white: iconBuildingWhite }
]

function logout() {
  auth.logout()
  router.push('/login')
}

function goToLogin() {
  router.push('/login')
}
</script>

<style scoped>
/* CSS Reset / Base styles for this page */
.landing-page {
  background-color: #ffffff;
  color: #6d6d6d;
  font-family: system-ui, -apple-system, sans-serif;
  min-height: 100vh;
}

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
.logo-text {
  display: flex;
  flex-direction: column;
}
.logo-title {
  color: #ff9797;
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
}
.logo-subtitle {
  color: #6d6d6d;
  font-size: 9px;
  line-height: 1.2;
  max-width: 120px;
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
  padding-left: 1.5rem;
  padding-right: 1.5rem;
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
  opacity: 1;
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
  flex-wrap: nowrap;
  overflow-x: auto;
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
.institutions-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}
.inst-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
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
.v-divider {
  width: 1px;
  height: 2.5rem;
  background-color: #e5e7eb;
  flex-shrink: 0;
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
  color: #ff9797;
}
.about-text p {
  margin-top: 0;
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
  background-color: #ff9797;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 14px 0 rgba(255, 151, 151, 0.39);
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
  border: none;
}
.stat-card:hover {
  background-color: #ff9797;
  transform: translateY(-4px);
  box-shadow: 0 10px 20px -5px rgba(255, 151, 151, 0.4);
}
.stat-icon-wrapper {
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
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
  border-bottom: 10px solid #ff9797;
  /*border-radius: 1.5rem;*/
}

/* SEARCH SECTION */
.search-section {
  padding: 0rem 0 5rem 0;
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
  background-color: #ebebeb70;
}
@media (min-width: 768px) {
  .search-container {
    flex-direction: row;
    justify-content: space-between;
    text-align: left;
  }
}
.search-text h3 {
  font-size: 32px;
  font-weight: 700;
  color: #6d6d6d;
  margin-bottom: 0.5rem;
}
.search-text p {
  color: #ff9797;
  font-size: 1.125rem;
  font-weight: 600;
  margin-top: 0;
}
.search-box {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}
@media (min-width: 768px) {
  .search-box {
    width: auto;
  }
}
.search-btn {
  padding: 1rem 3rem;
  font-size: 1.125rem;
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
.footer-logo-text {
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.2;
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
