
<template>
    <v-card v-if="user" style="border-radius: 20px;">
      <v-card-title class="text-h5">
        <v-icon left>mdi-account</v-icon>
        {{ user.nombre }} {{ user.apellido }}
      </v-card-title>

      <v-card-text>
        <v-form ref="form">
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="user.nombre"
                label="Nombre"
                prepend-icon="mdi-account"
                outlined
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="user.apellido"
                label="Apellido"
                outlined
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="user.email"
                label="Email"
                prepend-icon="mdi-email"
                outlined
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="user.rol"
                :items="['Admin', 'Moderador', 'Usuario']"
                label="Rol"
                prepend-icon="mdi-shield-account"
                outlined
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="user.soles"
                label="Soles"
                type="number"
                prepend-icon="mdi-star"
                outlined
              />
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <div class="d-flex justify-space-between align-center">
            <div>
              <strong>Estado:</strong>
              <v-chip :color="user.activo ? 'success' : 'error'" class="ml-3">
                {{ user.activo ? 'Activo' : 'Inactivo' }}
              </v-chip>
            </div>

            <div class="d-flex gap-2">
              <v-btn
                color="warning"
                @click="$emit('reset-password', user)"
              >
                <v-icon left>mdi-lock-reset</v-icon>
                Resetear Clave
              </v-btn>

              <v-btn
                :color="user.activo ? 'error' : 'success'"
                @click="$emit('toggle-active', user)"
              >
                {{ user.activo ? 'Desactivar' : 'Activar' }}
              </v-btn>
            </div>
          </div>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="close">Cancelar</v-btn>
        <v-btn color="primary" @click="save">Guardar Cambios</v-btn>
      </v-card-actions>
    </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  user: Object
})

const emit = defineEmits(['update:modelValue', 'update:user', 'reset-password', 'toggle-active'])

const dialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const user = computed(() => props.user)

const close = () => {
  dialog.value = false
}

const save = () => {
  emit('update:user', { ...user.value })
  close()
}
</script>

<style scoped>
.gap-2 {
  gap: 12px;
}
</style>