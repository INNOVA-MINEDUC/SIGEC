<template>
  <div class="charge-page">
    <AppNavbar />

    <!-- ── HERO ── -->
    <section class="hero">
      <img src="@/assets/hero_charge_data.jpg" alt="Hero background" class="hero-bg" />
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 class="hero-title">Importar Datos</h1>
        <p class="hero-subtitle">Sube y Administra tus archivos web</p>
      </div>
    </section>

    <!-- ── MAIN CONTENT ── -->
    <section class="content-section">
      <div class="content-container">
        <div class="main-card">
          <div class="card-row">

            <!-- Left Column -->
            <div class="card-left">
              <div class="section-label">IMPORTAR EXCEL</div>
              <h2 class="section-heading">Datos del Ministerio<br />de Salud</h2>

              <div v-if="lastUpload" class="last-upload-card">
                <div class="last-upload-header">
                  <v-icon size="18" color="#ff9797">mdi-circle</v-icon>
                  <span class="last-upload-title">Última carga</span>
                </div>
                <div class="last-upload-grid">
                  <div v-for="field in lastUploadFields" :key="field.label" class="last-upload-field">
                    <div class="field-label">{{ field.label }}</div>
                    <div class="field-value">{{ field.value }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column -->
            <div class="card-right">
              <div class="upload-zone">
                <img src="@/assets/upload_icon.png" alt="Upload icon" class="upload-img" />
                <div class="upload-text">Arrastre y suelte su archivo</div>
                <div class="upload-or">o</div>
                <input type="file" ref="fileInput" accept=".xlsx,.xls" class="file-input" @change="onFileChange" />
                <button class="upload-btn" @click="fileInput.click()">Subir Archivos</button>
                <div class="upload-hint">Tamaño hasta 100 MB</div>
              </div>
            </div>
          </div>

          <!-- Resumen -->
          <v-alert v-if="rows.length" type="success" variant="tonal" class="result-alert" icon="mdi-check-circle" color="success">
            Se cargaron {{ rows.length }} registros correctamente
          </v-alert>

          <!-- Tabla -->
          <v-data-table
            v-if="rows.length"
            :headers="tableHeaders"
            :items="rows"
            class="data-table"
            density="comfortable"
          />

          <!-- Botón limpiar -->
          <button v-if="rows.length" class="clear-btn" @click="clearData">LIMPIAR DATOS</button>
        </div>

        <!-- Historial -->
        <div class="history-header">
          <v-icon size="28" color="green-darken-3">mdi-bookshelf</v-icon>
          <h2 class="history-title">Historial de cargas</h2>
        </div>

        <div class="history-card">
          <v-data-table
            v-if="uploadHistory.length"
            :headers="historyHeaders"
            :items="uploadHistory"
            density="comfortable"
          />
          <div v-else class="empty-state">No hay cargas registradas aún</div>
        </div>
      </div>
    </section>

    <AppFooter />
  </div>
</template>

<script setup>
import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'
import { useExcelUpload } from '@/composables/useExcelUpload'

const {
  fileInput, rows, lastUpload, uploadHistory,
  historyHeaders, tableHeaders, lastUploadFields,
  onFileChange, clearData
} = useExcelUpload()
</script>

<style scoped>
/* ── BASE ── */
.charge-page {
  background-color: var(--sigec-bg);
  color: var(--sigec-text);
  font-family: var(--sigec-font);
  min-height: 100vh;
}

/* ── HERO override ── */
.hero-subtitle { font-size: 1.5rem; font-weight: 700; }

/* ── CONTENT SECTION ── */
.content-section  { background-color: var(--sigec-bg); padding: 3rem 1.5rem 0; }
.content-container { max-width: 1000px; margin: 0 auto; }

/* ── MAIN CARD ── */
.main-card {
  background-color: var(--sigec-bg-muted);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.card-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
}
@media (max-width: 768px) {
  .card-row { grid-template-columns: 1fr; }
}

/* ── LEFT COLUMN ── */
.section-label {
  color: var(--sigec-primary);
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}
.section-heading {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  line-height: 1.25;
  margin-bottom: 1.5rem;
}

/* ── LAST UPLOAD CARD ── */
.last-upload-card {
  background-color: var(--sigec-bg);
  border-radius: 0.2rem;
  padding: 1rem 1.25rem;
  margin-top: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.last-upload-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.last-upload-title {
  font-size: 1rem;
  font-weight: 700;
  color: #333;
}
.last-upload-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}
.field-label { font-size: 0.75rem; color: #9e9e9e; }
.field-value { font-size: 0.875rem; font-weight: 700; color: #333; }

/* ── UPLOAD ZONE ── */
.card-right {
  display: flex;
  align-items: stretch;
  justify-content: center;
  background-color: var(--sigec-bg);
  padding: 1rem;
  border-radius: 1rem;
}
.upload-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1.5rem 1.5rem;
  border: 2px dashed #a8cce8;
  border-radius: 0.5rem;
  background-color: var(--sigec-bg);
  width: 100%;
  transition: all 0.2s ease;
}
.upload-zone:hover {
  background-color: #f8fbff;
  border-color: #7bb3d8;
}
.upload-img  { width: 70px; height: 70px; object-fit: contain; margin-bottom: 0.5rem; }
.upload-text { color: var(--sigec-text); font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem; }
.upload-or {
  color: var(--sigec-text-muted);
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 80%;
}
.upload-or::before,
.upload-or::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: #97a9ff;
}
.file-input  { display: none; }
.upload-btn {
  background-color: var(--sigec-primary);
  color: white;
  border-radius: 0.5rem;
  border: none;
  padding: 0.625rem 2.5rem;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}
.upload-btn:hover { opacity: 0.9; }
.upload-hint { margin-top: 0.5rem; font-size: 0.7rem; color: #9e9e9e; }

/* ── RESULTS ── */
.result-alert { margin-top: 2rem; border-radius: 0.5rem; }
.data-table   { margin-top: 1rem; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
.clear-btn {
  margin-top: 1.5rem;
  background-color: var(--sigec-primary);
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.625rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}
.clear-btn:hover { opacity: 0.9; }

/* ── HISTORY ── */
.history-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 3rem 0 1rem;
}
.history-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #333;
}
.history-card {
  background-color: var(--sigec-bg);
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  overflow: hidden;
  margin-bottom: 2.5rem;
}
.empty-state {
  padding: 1rem;
  text-align: center;
  font-size: 0.875rem;
  color: #9e9e9e;
}
</style>
