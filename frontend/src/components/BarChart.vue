<template>
  <div id="chartdivcasos"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, watch } from "vue"
import * as am5 from "@amcharts/amcharts5"
import * as am5xy from "@amcharts/amcharts5/xy"
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated"
import { useCasosStore } from '@/stores/casos'

const casosStore = useCasosStore()

let root
let series
let yAxis

const RANGOS = [
  { label: "Mayores de 16", min: 16, max: 99 },
  { label: "15 años",       min: 15, max: 15 },
  { label: "14 años",       min: 14, max: 14 },
  { label: "13 años",       min: 13, max: 13 },
  { label: "Menores de 12", min: 0,  max: 12 },
]

// Orden fijo: de menor a mayor edad (Menores de 12 arriba, Mayores de 16 abajo)
const buildData = () =>
  RANGOS.map(r => ({
    edad: r.label,
    value: casosStore.casos.filter(c => {
      const edad = Number(c.nina?.edad)
      return edad >= r.min && edad <= r.max
    }).length
  }))

const updateChart = () => {
  if (!series || !yAxis) return
  const data = buildData()
  // setAll fuerza al eje X a recalcular su máximo con los nuevos datos
  yAxis.data.setAll(data)
  series.data.setAll(data)
}

onMounted(() => {
  root = am5.Root.new("chartdivcasos")
  root._logo?.dispose()
  root.setThemes([am5themes_Animated.new(root)])

  const chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: false,
      panY: false,
      wheelX: "none",
      wheelY: "none",
      paddingLeft: 0,
      paddingBottom: 0
    })
  )
  chart.zoomOutButton.set("forceHidden", true)

  // Eje Y — orden fijo, sin reordenamiento
  const yRenderer = am5xy.AxisRendererY.new(root, {
    minGridDistance: 20,
    inversed: true,
    minorGridEnabled: false
  })
  // Sin líneas horizontales
  yRenderer.grid.template.set("visible", false)

  yAxis = chart.yAxes.push(
    am5xy.CategoryAxis.new(root, {
      maxDeviation: 0,
      categoryField: "edad",
      renderer: yRenderer
    })
  )

  // Eje X — sin etiquetas, solo líneas verticales
  const xRenderer = am5xy.AxisRendererX.new(root, {
    strokeOpacity: 0,
    minGridDistance: 60
  })
  // Líneas verticales visibles
  xRenderer.grid.template.setAll({ strokeOpacity: 0.1, stroke: am5.color("#ff9797") })

  const xAxis = chart.xAxes.push(
    am5xy.ValueAxis.new(root, {
      maxDeviation: 0,
      min: 0,
      strictMinMax: true,
      extraMax: 0.25,   // espacio extra para que la etiqueta exterior no se corte
      renderer: xRenderer
    })
  )

  // Ocultar etiquetas del eje X
  xAxis.get("renderer").labels.template.set("visible", false)

  // Serie
  series = chart.series.push(
    am5xy.ColumnSeries.new(root, {
      xAxis,
      yAxis,
      valueXField: "value",
      categoryYField: "edad",
      tooltip: am5.Tooltip.new(root, {
        pointerOrientation: "left",
        labelText: "{categoryY}: [bold]{valueX}[/] casos"
      })
    })
  )

  series.columns.template.setAll({
    cornerRadiusBR: 6,
    cornerRadiusTR: 6,
    strokeOpacity: 0,
    fill: am5.color("#ff9797"),
    stroke: am5.color("#ff9797"),
    maxHeight: 16,
    minWidth: 4,    // barra mínima visible aunque sólo haya 1 caso
  })

  // Etiqueta fuera de la barra (a la derecha), siempre visible
  series.bullets.push(() => {
    const label = am5.Label.new(root, {
      text: "{valueX}",
      fill: am5.color("#e05555"),
      centerX: 0,           // se ancla al extremo derecho de la barra
      centerY: am5.p50,
      populateText: true,
      fontSize: 11,
      fontWeight: "700",
      paddingLeft: 6,
    })
    // Ocultar la etiqueta cuando el valor es 0 (queda limpio)
    label.adapters.add("visible", (_v, target) =>
      (target.dataItem?.get("valueX") ?? 0) > 0
    )
    return am5.Bullet.new(root, { locationX: 1, sprite: label })
  })

  // Datos iniciales en orden fijo
  const initialData = buildData()
  yAxis.data.setAll(initialData)
  series.data.setAll(initialData)

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
#chartdivcasos {
  width: 100%;
  height: 400px;
}
</style>