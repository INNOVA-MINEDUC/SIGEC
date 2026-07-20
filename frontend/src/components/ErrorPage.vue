<template>
  <div class="error-wrapper">
    <div class="error-card">
      <div class="error-code">{{ code }}</div>
      <div class="error-icon">{{ icon }}</div>
      <h1 class="error-title">{{ title }}</h1>
      <p class="error-msg">
        <slot />
      </p>
      <div class="error-actions">
        <router-link to="/" class="error-btn">Volver al inicio</router-link>
        <button type="button" class="error-btn error-btn-ghost" @click="volver">
          Regresar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

defineProps({
  code:  { type: String, required: true },
  icon:  { type: String, default: '' },
  title: { type: String, required: true },
})

const router = useRouter()

// Si no hay historial previo (entrada directa por URL) se vuelve al inicio
const volver = () => {
  if (window.history.length > 1) router.back()
  else router.push('/')
}
</script>

<style scoped>
.error-wrapper {
  min-height: calc(100vh - 4rem);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  padding: 1.5rem;
}
.error-card {
  text-align: center;
  background: white;
  border-radius: 1rem;
  padding: 3rem 2.5rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  max-width: 440px;
  width: 100%;
}
.error-code {
  font-size: 4.5rem;
  font-weight: 900;
  line-height: 1;
  color: #10233f;
  letter-spacing: 0.05em;
}
.error-icon {
  font-size: 2.5rem;
  margin: 0.5rem 0 1rem;
}
.error-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.75rem;
}
.error-msg {
  color: #6b7280;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}
.error-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}
.error-btn {
  display: inline-block;
  background: #10233f;
  color: white;
  padding: 0.6rem 1.75rem;
  border-radius: 0.5rem;
  border: 2px solid #10233f;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: opacity 0.2s;
}
.error-btn:hover { opacity: 0.85; }
.error-btn-ghost {
  background: transparent;
  color: #10233f;
}
</style>
