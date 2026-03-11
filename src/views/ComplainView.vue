<template>
  <v-container class="d-flex justify-center">
    <v-stepper :items="['Contacto', 'Queja', 'Información']">
      <template v-slot:item.1>
        <DatosContacto />
      </template>

      <template v-slot:item.2>
        <v-card class="pa-6" elevation="16" width="60vw" title="Información de la queja:"
          subtitle="Recuerda llenar toda la información del FORMULARIO"
          text="Por favor, completa todos los campos con información verídica.">
          <v-form class="d-flex flex-column align-center" style="width: 100%;">
            <v-select clearable label="Tipo de queja:" prepend-inner-icon="mdi-home-variant"
              :items="['Ambiente', 'Cobros o  Contibusiones Adicionales']" class="w-50"></v-select>

            <v-textarea clearable label="Descripción de la Queja" prepend-inner-icon="mdi-information"
              class="w-75"></v-textarea>


            <v-textarea clearable label="Escriba aquí si tiene alguna solución recomendada:" prepend-inner-icon="mdi-information-outline"
              class="w-75"></v-textarea>

          </v-form>
        </v-card>
      </template>

      <template v-slot:item.3>
          <v-card class="pa-6" elevation="16" width="60vw" 
          title="Otra información (Opcional):"
          subtitle="Recuerda llenar toda la información del FORMULARIO"
          text="Por favor, completa todos los campos con información verídica.">
          <v-form class="d-flex flex-column align-center" style="width: 100%;">

            <v-textarea clearable label="Información Adicional:
" prepend-inner-icon="mdi-information"
              class="w-75"></v-textarea>


              <v-btn color="primary" @click="mostrarAlerta">Enviar Formulario</v-btn>

          </v-form>
        </v-card>
      </template>
    </v-stepper>
  </v-container>
</template>


<script setup>
import DatosContacto from '@/components/DatosContacto.vue';
import Swal from 'sweetalert2'

const mostrarAlerta = () => {
  Swal.fire({
    title: 'Guardado!',
    text: 'El registro se guardó correctamente',
    icon: 'success'
  })
}
</script>

<style scoped>
</style>