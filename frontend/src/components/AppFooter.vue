<template>
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
      <div class="footer-bottom">@ 2023 ByteSpace. All rights reserved.</div>
    </div>
  </footer>
</template>

<script setup>
import logoDigecade1 from '@/assets/LOGOS_DCE1.png'
</script>

<style scoped>
.footer {
  background-color: #ff9797;
  color: white;
  padding: 1rem 0 1.5rem;
  margin-top: 4rem;
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
  .footer-grid { grid-template-columns: repeat(3, 1fr); gap: 3rem; }
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
.footer-item .v-icon { margin-top: 0.125rem; opacity: 1; }
.footer-item span { opacity: 0.95; }
.footer-bottom {
  margin-top: 2rem;
  padding-top: 1rem;
  text-align: right;
  font-size: 0.75rem;
  opacity: 0.8;
  border-top: 1px solid #ffffff;
}
</style>
