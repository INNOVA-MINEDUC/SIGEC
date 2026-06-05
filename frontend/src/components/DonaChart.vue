<template>
  <div id="chartdivdona"></div>
</template>

<script setup>
import * as am5 from "@amcharts/amcharts5"
import * as am5percent from "@amcharts/amcharts5/percent"
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated"
import { onMounted, onBeforeUnmount } from "vue"
import { useCasosStore } from '@/stores/casos'

const casosStore = useCasosStore()

const pendientes = casosStore.casosPorEstado('pendiente')

let root

onMounted(() => {
  // Crear el root del gráfico
  root = am5.Root.new("chartdivdona")
  root._logo.dispose()


  // Aplicar tema animado
  root.setThemes([am5themes_Animated.new(root)])

  // Crear el gráfico tipo Pie (dona)
  const chart = root.container.children.push(am5percent.PieChart.new(root, {
    radius: am5.percent(100),
    innerRadius: am5.percent(50),
    layout: root.horizontalLayout
  }))

  // Crear la serie
  const series = chart.series.push(am5percent.PieSeries.new(root, {
    name: "Series",
    valueField: "value",
    categoryField: "casos"
  }))

  // Etiquetas internas ocultas
  series.labels.template.setAll({
    forceHidden: true,
    visible: false
  })

  series.ticks.template.setAll({
    forceHidden: true,
    visible: false
  })


  // 🎨 COLORES PERSONALIZADOS (Tema Rosa para igualar el resto de la app)
  series.get("colors").set("colors", [
    am5.color("#ff9797"), // Rosa principal
    am5.color("#ffb3b3"), // Rosa claro
    am5.color("#e8e8e8"), // Gris claro / Neutro
  ])

  // Asignar datos
  series.data.setAll([
    { casos: "Casos Resultos", value: casosStore.casosPorEstado('ausente').length + casosStore.casosPorEstado('presente').length },
    // { casos: "Conección a Internet", value: 301.9 },
    // { casos: "Resultos", value: 201.1 },
    { casos: "Casos Pendientes", value: casosStore.casosPorEstado('pendiente').length },
    { casos: "Casos Faltantes", value: casosStore.casosPorEstado('faltante').length },
  ])



  // Bordes blancos entre slices, sin degradado
  series.slices.template.setAll({
    stroke: am5.color(0xffffff),
    strokeWidth: 3,
    strokeOpacity: 1
  })

  // Crear leyenda
  const legend = chart.children.push(am5.Legend.new(root, {
    centerY: am5.percent(50),
    y: am5.percent(50),
    layout: root.verticalLayout
  }))

  legend.valueLabels.template.setAll({ 
    textAlign: "right",
    text: "{valuePercentTotal.formatNumber('0')}%"
  })
  legend.labels.template.setAll({
    width: 140,
    oversizedBehavior: "truncate"
  })

  legend.data.setAll(series.dataItems)


  // Animar al cargar
  series.appear(1000, 100)
})

onBeforeUnmount(() => {
  if (root) root.dispose()
})
</script>

<style scoped>
#chartdivdona {
  width: 100%;
  height: 300px;
}
</style>