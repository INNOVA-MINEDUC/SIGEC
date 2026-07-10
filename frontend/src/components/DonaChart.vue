<template>
  <div id="chartdivdona"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, watch } from "vue"
import * as am5 from "@amcharts/amcharts5"
import * as am5percent from "@amcharts/amcharts5/percent"
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated"
import { useCasosStore } from "@/stores/casos"

const casosStore = useCasosStore()

let root
let series
let legend

const buildData = () => [
  { casos: "Verificados en el SIRE",      value: casosStore.casosPorEstado("Verificados en el SIRE").length },
  { casos: "Sin Verificar en el SIRE",    value: casosStore.casosPorEstado("sin Verificar en el SIRE").length },
  { casos: "Verificados en Quejas",       value: casosStore.casosPorEstado("Verificados en el Sistema de Quejas, Comentarios o Sugerencias").length },
  { casos: "Sin Quejas",                  value: casosStore.casosPorEstado("sin Quejas").length },
]

onMounted(() => {
  root = am5.Root.new("chartdivdona")
  root._logo?.dispose()
  root.setThemes([am5themes_Animated.new(root)])

  const chart = root.container.children.push(
    am5percent.PieChart.new(root, {
      radius: am5.percent(100),
      innerRadius: am5.percent(50),
      layout: root.horizontalLayout
    })
  )

  series = chart.series.push(
    am5percent.PieSeries.new(root, {
      valueField: "value",
      categoryField: "casos"
    })
  )

  series.labels.template.setAll({ forceHidden: true, visible: false })
  series.ticks.template.setAll({ forceHidden: true, visible: false })

  series.get("colors").set("colors", [
    am5.color("#10233f"),
    am5.color("#1F3864"),
    am5.color("#6d6d6d"),
    am5.color("#b0b0b0")
  ])

  series.slices.template.setAll({
    stroke: am5.color(0xffffff),
    strokeWidth: 3,
    strokeOpacity: 1
  })

  legend = chart.children.push(
    am5.Legend.new(root, {
      centerY: am5.percent(50),
      y: am5.percent(50),
      layout: root.verticalLayout
    })
  )

  legend.valueLabels.template.setAll({
    textAlign: "right",
    text: "{valuePercentTotal.formatNumber('0.')}%"
  })

  legend.labels.template.setAll({
    width: 140,
    oversizedBehavior: "truncate"
  })

  // Cargar datos y esperar a que la serie los procese antes de pasarlos a la leyenda
  series.data.setAll(buildData())

  series.events.on("datavalidated", () => {
    legend.data.setAll(series.dataItems)
  })

  series.appear(1000, 100)
})

watch(
  () => casosStore.casos,
  () => {
    if (!series) return
    series.data.setAll(buildData())
  },
  { deep: true }
)

onBeforeUnmount(() => {
  if (root) root.dispose()
})
</script>

<style scoped>
#chartdivdona {
  width: 100%;
  height: 300px;
  filter: drop-shadow(2px 20px 12px);
}
</style>