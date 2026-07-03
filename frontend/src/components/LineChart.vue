<template>
  <div id="chartdivline"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, watch } from "vue"
import * as am5 from "@amcharts/amcharts5"
import * as am5xy from "@amcharts/amcharts5/xy"
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated"
import { useCasosStore } from '@/stores/casos'

const casosStore = useCasosStore()

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

let root
let series
let xAxis

const buildData = () =>
  MESES.map((month, i) => ({
    month,
    value: casosStore.casosPorMes(i + 1).length
  }))

const updateChart = () => {
  if (!series || !xAxis) return
  const data = buildData()
  xAxis.data.setAll(data)
  series.data.setAll(data)
}

onMounted(() => {
  root = am5.Root.new("chartdivline")
  root._logo?.dispose()
  root.setThemes([am5themes_Animated.new(root)])

  const chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: true,
      panY: false,
      wheelX: "panX",
      wheelY: "zoomX",
      pinchZoomX: true,
      paddingLeft: 0,
      paddingRight: 1
    })
  )

  const cursor = chart.set("cursor", am5xy.XYCursor.new(root, {}))
  cursor.lineY.set("visible", false)

  // Eje X
  const xRenderer = am5xy.AxisRendererX.new(root, {
    minGridDistance: 30,
    minorGridEnabled: true
  })
  xRenderer.labels.template.setAll({
    rotation: -90,
    centerY: am5.p50,
    centerX: am5.p100,
    paddingRight: 15
  })
  xRenderer.grid.template.setAll({ location: 1 })

  xAxis = chart.xAxes.push(
    am5xy.CategoryAxis.new(root, {
      maxDeviation: 0.3,
      categoryField: "month",
      renderer: xRenderer,
      tooltip: am5.Tooltip.new(root, {})
    })
  )

  // Eje Y — una sola instancia del renderer + maxPrecision: 0 para enteros
  const yRenderer = am5xy.AxisRendererY.new(root, { strokeOpacity: 0.1 })

  const yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      maxDeviation: 0.3,
      min: 0,
      maxPrecision: 0,
      renderer: yRenderer   // ← misma instancia, no una nueva
    })
  )

  // Serie
  series = chart.series.push(
    am5xy.ColumnSeries.new(root, {
      name: "Casos",
      xAxis,
      yAxis,
      valueYField: "value",
      categoryXField: "month",
      sequencedInterpolation: true,
      tooltip: am5.Tooltip.new(root, { labelText: "{categoryX}: [bold]{valueY}[/] casos" })
    })
  )

  series.columns.template.setAll({
    cornerRadiusTL: 5,
    cornerRadiusTR: 5,
    strokeOpacity: 0,
    width: am5.percent(40),
    fill: am5.color("#10233f"),
    stroke: am5.color("#10233f")
  })

  // Datos iniciales
  const data = buildData()
  xAxis.data.setAll(data)
  series.data.setAll(data)

  series.appear(1000)
  chart.appear(1000, 100)
})

watch(() => casosStore.casos, () => {
  updateChart()
}, { deep: true })

onBeforeUnmount(() => {
  if (root) root.dispose()
})
</script>

<style scoped>
#chartdivline {
  width: 100%;
  height: 300px;
  filter: drop-shadow(2px 20px 12px);
}
</style>