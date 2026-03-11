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

  // Desactivar labels y ticks PERMANENTEMENTE
  series.labels.template.setAll({
    forceHidden: true,
    visible: false
  })

  series.ticks.template.setAll({
    forceHidden: true,
    visible: false
  })


  // 🎨 COLORES PERSONALIZADOS
  series.get("colors").set("colors", [
    am5.color("#6794DC"),
    // am5.color("#4F7CC4"),
    am5.color("#3A64A8"),
    // am5.color("#3A64A8"),
    // am5.color("#2883D1"),
    am5.color("#CCCCCC"),
  ])

  // Asignar datos
  series.data.setAll([
    { casos: "Casos Resultos", value: casosStore.casosPorEstado('ausente').length + casosStore.casosPorEstado('presente').length },
    // { casos: "Conección a Internet", value: 301.9 },
    // { casos: "Resultos", value: 201.1 },
    { casos: "Casos Pendientes", value: casosStore.casosPorEstado('pendiente').length },
    { casos: "Casos Faltantes", value: casosStore.casosPorEstado('faltante').length },
  ])



  // Añadir degradado
  series.slices.template.setAll({
    strokeOpacity: 0,
    fillGradient: am5.RadialGradient.new(root, {
      stops: [
        { brighten: -0.8 },
        { brighten: -0.8 },
        { brighten: -0.5 },
        { brighten: 0 },
        { brighten: -0.6 }
      ]
    })
  })

  // Crear leyenda
  const legend = chart.children.push(am5.Legend.new(root, {
    centerY: am5.percent(50),
    y: am5.percent(50),
    layout: root.verticalLayout
  }))

  legend.valueLabels.template.setAll({ textAlign: "end" })
  legend.labels.template.setAll({
    maxWidth: 140,
    width: 140,
    oversizedBehavior: "wrap"
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
  width: 80%;
  height: 400px;
  filter: drop-shadow(2px 20px 12px);
}
</style>