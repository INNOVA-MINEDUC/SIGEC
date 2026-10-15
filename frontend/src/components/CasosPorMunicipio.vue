<template>
  <div class="resumen-muni">
    <div class="muni-header">
      <div>
        <h3 class="muni-title">Casos por municipio</h3>
        <p class="muni-subtitle">{{ subtitulo }}</p>
      </div>
      <input
        v-if="resumen.items.length > 10"
        v-model="busqueda"
        type="search"
        class="muni-buscar"
        placeholder="Buscar municipio…"
        aria-label="Buscar municipio en el resumen"
      />
    </div>

    <p v-if="casosStore.loading && !resumen.items.length" class="muni-estado">Cargando casos…</p>
    <p v-else-if="casosStore.error" class="muni-estado muni-error" role="alert">
      No se pudieron cargar los casos. Intente aplicar los filtros de nuevo.
    </p>
    <p v-else-if="!resumen.items.length" class="muni-estado">
      No hay casos con municipio registrado para los filtros aplicados.
    </p>

    <div v-else class="muni-tabla-wrap" :class="{ actualizando: casosStore.loading }" :aria-busy="casosStore.loading">
      <table class="muni-tabla">
        <thead>
          <tr>
            <th scope="col" class="col-num">#</th>
            <th scope="col">Municipio</th>
            <th scope="col" class="col-depto">Departamento</th>
            <th scope="col" class="col-casos">Casos</th>
            <th scope="col" class="col-barra"><span class="sr-only">Proporción</span></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="m in visibles"
            :key="m.id ?? `${m.departamento}-${m.nombre}`"
            :class="{ activa: esSeleccionado(m) }"
            tabindex="0"
            :title="`Ver ${m.nombre} en el mapa`"
            @click="$emit('seleccionar', { departamento: m.departamento, municipio: m.nombre })"
            @keydown.enter="$emit('seleccionar', { departamento: m.departamento, municipio: m.nombre })"
          >
            <td class="col-num">{{ m.posicion }}</td>
            <td class="col-nombre">{{ m.nombre }}</td>
            <td class="col-depto">{{ m.departamento }}</td>
            <td class="col-casos">{{ m.total.toLocaleString('es-GT') }}</td>
            <td class="col-barra" aria-hidden="true"><span class="barra"><span :style="{ width: ancho(m.total) }"></span></span></td>
          </tr>
          <tr v-if="!visibles.length">
            <td colspan="5" class="muni-estado">Ningún municipio coincide con «{{ busqueda }}».</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="resumen.items.length" class="muni-nota">
      {{ resumen.items.length }} {{ resumen.items.length === 1 ? 'municipio' : 'municipios' }} con casos
      <template v-if="resumen.sinMunicipio">
        · {{ resumen.sinMunicipio }} {{ resumen.sinMunicipio === 1 ? 'caso' : 'casos' }} sin municipio registrado
      </template>
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCasosStore } from '@/stores/casos'
import { contarPorMunicipio } from '@/helpers/estadisticasCasos'

// Resumen de casos por municipio de residencia, de mayor a menor (empates por
// nombre), calculado sobre los mismos casos filtrados que el mapa.
const props = defineProps({
  departamento: { type: String, default: '' },
  municipio:    { type: String, default: '' },
})
defineEmits(['seleccionar'])

const casosStore = useCasosStore()
const busqueda = ref('')

const sinTildes = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

const resumen = computed(() => contarPorMunicipio(casosStore.casos))

// La posición se fija antes de buscar para que no cambie al filtrar la lista
const visibles = computed(() => {
  const q = sinTildes(busqueda.value)
  return resumen.value.items
    .map((m, i) => ({ ...m, posicion: i + 1 }))
    .filter(m => !q || sinTildes(m.nombre).includes(q) || sinTildes(m.departamento).includes(q))
})

const subtitulo = computed(() => {
  if (props.municipio) return `Municipio seleccionado: ${props.municipio}, ${props.departamento}`
  if (props.departamento) return `Municipios del departamento de ${props.departamento}`
  return 'Todos los municipios del país con casos registrados'
})

const esSeleccionado = (m) =>
  !!props.municipio && sinTildes(m.nombre) === sinTildes(props.municipio) &&
  sinTildes(m.departamento) === sinTildes(props.departamento)

const maximo = computed(() => Math.max(...resumen.value.items.map(m => m.total), 1))
const ancho = (total) => `${Math.max((total / maximo.value) * 100, 2)}%`
</script>

<style scoped>
.resumen-muni { display: flex; flex-direction: column; gap: 0.75rem; }

.muni-header {
  display: flex; justify-content: space-between; align-items: flex-end;
  gap: 1rem; flex-wrap: wrap;
}
.muni-title    { font-size: 0.95rem; font-weight: 700; color: #10233f; margin: 0; }
.muni-subtitle { font-size: 0.75rem; color: #6a8299; margin: 0.15rem 0 0; }
.muni-buscar {
  width: min(16rem, 100%); padding: 0.45rem 0.7rem; font-size: 0.8rem;
  border: 1px solid #e0e0e0; border-radius: 0.5rem; background: #fafafa; outline: none;
}
.muni-buscar:focus { border-color: #17c4e8; background: #fff; }

.muni-estado { font-size: 0.85rem; color: #6d6d6d; padding: 0.75rem 0; }
.muni-error  { color: #b71c1c; }
.muni-nota   { font-size: 0.75rem; color: #6a8299; margin: 0; }

.muni-tabla-wrap {
  max-height: 420px; overflow: auto;
  border: 1px solid #eef2f7; border-radius: 0.6rem;
  transition: opacity 0.2s;
}
.muni-tabla-wrap.actualizando { opacity: 0.55; }

.muni-tabla { width: 100%; border-collapse: collapse; font-size: 0.8rem; color: #1a1a1a; }
.muni-tabla thead th {
  position: sticky; top: 0; z-index: 1;
  background: #10233f; color: #fff; font-weight: 600; text-align: left;
  padding: 0.55rem 0.75rem; font-size: 0.75rem;
}
.muni-tabla td { padding: 0.4rem 0.75rem; border-bottom: 1px solid #f1f4f8; }
.muni-tabla tbody tr { cursor: pointer; transition: background 0.15s; }
.muni-tabla tbody tr:hover { background: #f1f6fb; }
.muni-tabla tbody tr:focus-visible { outline: 2px solid #17c4e8; outline-offset: -2px; }
.muni-tabla tbody tr.activa { background: #e0f6fb; font-weight: 600; }

.col-num   { width: 2.5rem; text-align: right; color: #6a8299; }
.col-casos { width: 4.5rem; text-align: right; font-weight: 700; color: #10233f; }
.muni-tabla thead th.col-casos { text-align: right; }
.col-barra { width: 28%; }
.col-depto { color: #6d6d6d; }
.barra { display: block; height: 8px; background: #eef2f7; border-radius: 999px; overflow: hidden; }
.barra > span { display: block; height: 100%; background: #17c4e8; border-radius: 999px; }

.sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;
}

@media (max-width: 640px) {
  .col-barra, .col-depto { display: none; }
  .muni-tabla td, .muni-tabla thead th { padding: 0.4rem 0.5rem; }
}
</style>
