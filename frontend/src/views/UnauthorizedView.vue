<template>
  <div class="unauth-wrapper">
    <div class="unauth-card">
      <div class="unauth-icon">🔒</div>
      <h1 class="unauth-title">Acceso denegado</h1>
      <p class="unauth-msg">
        No tienes permisos para acceder a esta sección.<br />
        Contacta al administrador si crees que esto es un error.
      </p>
      <router-link to="/" class="unauth-btn">Volver al inicio</router-link>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.unauth-wrapper {
  min-height: calc(100vh - 4rem);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
}
.unauth-card {
  text-align: center;
  background: white;
  border-radius: 1rem;
  padding: 3rem 2.5rem;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  max-width: 400px;
  width: 90%;
}
.unauth-icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
}
.unauth-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.75rem;
}
.unauth-msg {
  color: #6b7280;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}
.unauth-btn {
  display: inline-block;
  background: #ff9797;
  color: white;
  padding: 0.6rem 1.75rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 600;
  transition: opacity 0.2s;
}
.unauth-btn:hover { opacity: 0.85; }
</style>
