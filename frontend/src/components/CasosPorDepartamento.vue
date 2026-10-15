<template>
  <div class="resumen">
    <div class="resumen-header">
      <span class="resumen-title">Casos por departamento</span>
      <span class="resumen-total">{{ casosStore.total.toLocaleString('es-GT') }} {{ casosStore.total === 1 ? 'caso' : 'casos' }}</span>
    </div>

    <p v-if="casosStore.loading && !resumen.items.length" class="resumen-estado">Cargando casos…</p>
    <p v-else-if="casosStore.error" class="resumen-estado resumen-error" role="alert">
      No se pudieron cargar los casos. Intente aplicar los filtros de nuevo.
    </p>
    <p v-else-if="!resumen.items.length" class="resumen-estado">No hay casos para los filtros aplicados.</p>

    <ol v-else class="resumen-lista" :class="{ actualizando: casosStore.loading }" :aria-busy="casosStore.loading">
      <li v-for="d in resumen.items" :key="d.nombre">
        <button
          type="button"
          class="resumen-fila"
          :class="{ activa: esSeleccionado(d.nombre) }"
          :aria-pressed="esSeleccionado(d.nombre)"
          :title="`Ver ${d.nombre} en el mapa`"
          @click="$emit('seleccionar', d.nombre)"
        >
          <span class="fila-nombre">{{ d.nombre }}</span>
          <span class="fila-barra" aria-hidden="true"><span :style="{ width: ancho(d.total) }"></span></span>
          <span class="fila-total">{{ d.total.toLocaleString('es-GT') }}</span>
        </button>
      </li>
    </ol>

    <p v-if="seleccionado && resumen.items.length" class="resumen-nota">
      {{ bloqueado
        ? 'Su perfil tiene acceso solo a este departamento.'
        : 'Se muestra el departamento seleccionado. Use «Regresar» en el mapa para ver todos.' }}
    </p>
    <p v-if="resumen.sinDepartamento" class="resumen-nota">
      {{ resumen.sinDepartamento }} {{ resumen.sinDepartamento === 1 ? 'caso' : 'casos' }} sin departamento registrado
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCasosStore } from '@/stores/casos'
import { contarPorDepartamento } from '@/helpers/estadisticasCasos'

// Total de casos por departamento a partir de los mismos casos filtrados que
// pintan el mapa y las tarjetas, ordenado de mayor a menor.
const props = defineProps({
  // Departamento seleccionado en el dashboard, para resaltarlo
  seleccionado: { type: String, default: '' },
  // Usuario con alcance departamental (no puede ver otros departamentos)
  bloqueado: { type: Boolean, default: false },
})
defineEmits(['seleccionar'])

const casosStore = useCasosStore()

const resumen = computed(() => contarPorDepartamento(casosStore.casos))

const sinTildes = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
const esSeleccionado = (nombre) => !!props.seleccionado && sinTildes(nombre) === sinTildes(props.seleccionado)

const maximo = computed(() => Math.max(...resumen.value.items.map(d => d.total), 1))
const ancho = (total) => `${Math.max((total / maximo.value) * 100, 2)}%`
</script>

<style scoped>
.resumen { display: flex; flex-direction: column; height: 100%; min-height: 0; }

.resumen-header {
  display: flex; align-items: baseline; justify-content: space-between;
  gap: 0.5rem; margin-bottom: 0.75rem;
}
.resumen-title { font-size: 0.95rem; font-weight: 700; color: #10233f; }
.resumen-total { font-size: 0.75rem; color: #6a8299; white-space: nowrap; }

.resumen-estado { font-size: 0.85rem; color: #6d6d6d; padding: 1rem 0; }
.resumen-error  { color: #b71c1c; }
.resumen-nota   { margin-top: 0.5rem; font-size: 0.75rem; color: #6a8299; }

.resumen-lista {
  list-style: none; margin: 0; padding: 0;
  display: flex; flex-direction: column; gap: 2px;
  overflow-y: auto; max-height: 600px;
  transition: opacity 0.2s;
}
.resumen-lista.actualizando { opacity: 0.55; }

.resumen-fila {
  width: 100%;
  display: grid; grid-template-columns: minmax(96px, 9rem) 1fr auto;
  align-items: center; gap: 0.6rem;
  padding: 0.35rem 0.5rem; border: none; border-radius: 0.4rem;
  background: transparent; cursor: pointer; text-align: left;
  font: inherit; color: #1a1a1a; transition: background 0.15s;
}
.resumen-fila:hover { background: #f1f6fb; }
.resumen-fila:focus-visible { outline: 2px solid #17c4e8; outline-offset: 1px; }
.resumen-fila.activa { background: #e0f6fb; box-shadow: inset 3px 0 0 #17c4e8; }

.fila-nombre { font-size: 0.8rem; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fila-barra { height: 8px; background: #eef2f7; border-radius: 999px; overflow: hidden; }
.fila-barra > span { display: block; height: 100%; background: #10233f; border-radius: 999px; }
.fila-total { font-size: 0.8rem; font-weight: 700; color: #10233f; min-width: 2.5rem; text-align: right; }
</style>
