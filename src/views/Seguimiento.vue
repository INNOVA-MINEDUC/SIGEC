<template>
  <v-container class="d-flex justify-center">

    <v-timeline
      align="start"
      density="comfortable"
      class="timeline-center"
    >

      <v-timeline-item
        v-for="(evento, index) in eventos"
        :key="index"
        :dot-color="evento.color"
        :icon="evento.icon"
      >

        <!-- Fecha -->
        <template v-slot:opposite>
          <strong>{{ evento.fecha }}</strong>
        </template>

        <!-- Card -->
        <v-card class="text-center">

          <v-card-title class="justify-center">
            {{ evento.titulo }}
          </v-card-title>

          <v-card-text>

            {{ evento.descripcion }}

            <!-- estado final -->
            <div v-if="evento.estado" class="mt-4 d-flex justify-center">

              <v-chip
                v-if="evento.estado === 'estudio'"
                color="blue"
                prepend-icon="mdi-magnify"
                class="ma-1"
              >
                Continúa en estudio
              </v-chip>

              <v-chip
                v-if="evento.estado === 'finalizado'"
                color="green"
                prepend-icon="mdi-check-circle"
                class="ma-1"
              >
                Caso finalizado
              </v-chip>

            </div>

          </v-card-text>

        </v-card>

      </v-timeline-item>

    </v-timeline>

  </v-container>
</template>


<script setup>

const eventos = [
  {
    fecha: "10 Mar 2026",
    titulo: "Recepción del caso - Ministerio de Salud",
    descripcion: "El caso es recibido desde el Ministerio de Salud de Guatemala.",
    icon: "mdi-hospital-building",
    color: "blue"
  },
  {
    fecha: "11 Mar 2026",
    titulo: "Copia de Información",
    descripcion: "Se copia la información proporcionada para registro interno.",
    icon: "mdi-content-copy",
    color: "indigo"
  },
  {
    fecha: "12 Mar 2026",
    titulo: "Creación de Queja",
    descripcion: "Se registra la queja en el sistema de gestión.",
    icon: "mdi-alert-circle-outline",
    color: "purple"
  },
  {
    fecha: "13 Mar 2026",
    titulo: "Delegación Departamental Asignada",
    descripcion: "La queja es enviada a la delegación departamental correspondiente.",
    icon: "mdi-map-marker",
    color: "orange"
  },
  {
    fecha: "14 Mar 2026",
    titulo: "Delegación Municipal Asignada",
    descripcion: "La delegación municipal recibe el caso para seguimiento.",
    icon: "mdi-town-hall",
    color: "deep-orange"
  },
  {
    fecha: "15 Mar 2026",
    titulo: "Establecimiento Educativo Asignado",
    descripcion: "El establecimiento correspondiente analiza la queja.",
    icon: "mdi-hospital",
    color: "green"
  },
  {
    fecha: "16 Mar 2026",
    titulo: "Estado del Caso",
    descripcion: "Resultado del análisis del caso.",
    icon: "mdi-progress-clock",
    color: "grey",
    estado: "estudio" // cambiar a "finalizado"
  }
]

</script>

<style scoped>

.timeline-center{
  max-width: 900px;
  width: 100%;
}

/* espacio entre items */
:deep(.v-timeline-item){
  margin-bottom: 50px;
}

/* ancho para la fecha */
:deep(.v-timeline-item__opposite){
  min-width: 120px;
  text-align: right;
  padding-right: 20px;
  font-weight: 600;
}

/* separa el contenido de la línea */
:deep(.v-timeline-item__body){
  padding-left: 20px;
}

</style>