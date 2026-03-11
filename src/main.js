import { createApp } from 'vue'

// Rutas
import router from './router'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Íconos de Material Design
import '@mdi/font/css/materialdesignicons.css'

// Fuentes Roboto
import '@fontsource/roboto/100.css'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import '@fontsource/roboto/900.css'

// Pinia
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// Componente principal
import App from './App.vue'

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
  },
})

// crear pinia
const pinia = createPinia()

// activar persistencia
pinia.use(piniaPluginPersistedstate)

createApp(App)
  .use(pinia)
  .use(vuetify)
  .use(router)
  .mount('#app')