<template>
  <v-container>
    <h1 class="text-h5 mb-4">📊 Tabla con búsqueda y filtro</h1>

    <!-- Filtros -->
    <v-row class="mb-4" align="center" justify="space-between">
      <v-col cols="12" md="6">
        <v-text-field
        clearable
          v-model="search"
          label="Buscar..."
          variant="outlined"
          prepend-inner-icon="mdi-magnify"
        />
      </v-col>

      <v-col cols="12" md="4">
        <v-select
        clearable
        label="Filtrar por categoría"
        :items="categories"
        v-model="selectedCategory"  
        />
      </v-col>
    </v-row>

    <!-- Tabla -->
    <v-data-table
      :headers="headers"
      :items="filteredItems"
      class="elevation-2"
      :items-per-page="5"
    >
      <template #item.price="{ item }">
        ${{ item.price.toFixed(2) }}
      </template>
    </v-data-table>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'

const search = ref('')
const selectedCategory = ref(null)

const headers = [
  { title: 'Producto', key: 'name' },
  { title: 'Categoría', key: 'category' },
  { title: 'Precio', key: 'price' },
]

const items = ref([
  { name: 'Laptop', category: 'Electrónica', price: 950 },
  { name: 'Teléfono', category: 'Electrónica', price: 500 },
  { name: 'Camiseta', category: 'Ropa', price: 25 },
  { name: 'Pantalón', category: 'Ropa', price: 40 },
  { name: 'Mesa', category: 'Hogar', price: 150 },
  { name: 'Silla', category: 'Hogar', price: 80 },
])

const categories = ['Electrónica', 'Ropa', 'Hogar']

// Computed para filtrar por texto y categoría
const filteredItems = computed(() => {
  return items.value.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.value.toLowerCase()) ||
      item.category.toLowerCase().includes(search.value.toLowerCase())

    const matchesCategory =
      !selectedCategory.value || item.category === selectedCategory.value

    return matchesSearch && matchesCategory
  })
})
</script>
