<template>
  <div id="chartdivcasos"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from "vue"
import * as am5 from "@amcharts/amcharts5"
import * as am5xy from "@amcharts/amcharts5/xy"
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated"

import { useCasosStore } from '@/stores/casos'

const casosStore = useCasosStore()

let root

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
      paddingLeft: 0
    })
  )
  chart.zoomOutButton.set("forceHidden", true)

  const yRenderer = am5xy.AxisRendererY.new(root, {
    minGridDistance: 30,
    minorGridEnabled: true
  })
  yRenderer.grid.template.set("location", 1)

  const yAxis = chart.yAxes.push(
    am5xy.CategoryAxis.new(root, {
      maxDeviation: 0,
      categoryField: "casos",
      renderer: yRenderer,
      tooltip: am5.Tooltip.new(root, { themeTags: ["axis"] })
    })
  )

  const xAxis = chart.xAxes.push(
    am5xy.ValueAxis.new(root, {
      maxDeviation: 0,
      min: 0,
      numberFormatter: am5.NumberFormatter.new(root, { numberFormat: "#,###" }),
      extraMax: 0.1,
      renderer: am5xy.AxisRendererX.new(root, { strokeOpacity: 0.1, minGridDistance: 80 })
    })
  )

  const series = chart.series.push(
    am5xy.ColumnSeries.new(root, {
      name: "Usuarios",
      xAxis,
      yAxis,
      valueXField: "value",
      categoryYField: "casos",
      tooltip: am5.Tooltip.new(root, { pointerOrientation: "left", labelText: "{valueX}" })
    })
  )

  series.columns.template.setAll({
    cornerRadiusTR: 6,
    cornerRadiusBR: 6,
    strokeOpacity: 0
  })

  // ← ESTO SIGUE IGUAL: lee el color del dataContext
  series.columns.template.adapters.add("fill", (fill, target) => {
    const colorStr = target.dataItem?.dataContext?.color
    return colorStr ? am5.color(colorStr) : fill
  })

  series.columns.template.adapters.add("stroke", (stroke, target) => {
    const colorStr = target.dataItem?.dataContext?.color
    return colorStr ? am5.color(colorStr) : stroke
  })

  // ← AQUÍ ASIGNAS EL COLOR QUE QUIERAS A CADA BARRA
const data = [
  {
    casos: "Menores de 12",
    value: casosStore.casosPorEdad(12).length,
    color: "#D66A7A" // rojo
  },
  {
    casos: "13 años",
    value: casosStore.casosPorEdad(13).length,
    color: "#C36E8D"
  },
  {
    casos: "14 años",
    value: casosStore.casosPorEdad(14).length,
    color: "#A7749F"
  },
  {
    casos: "15 años",
    value: casosStore.casosPorEdad(15).length,
    color: "#8A79AE"
  },
  {
    casos: "16 años",
    value: casosStore.casosPorEdad(16).length,
    color: "#667EBB"
  },
  {
    casos: "17 años",
    value: casosStore.casosPorEdad(17).length,
    color: "#3A64A8" // azul fuerte
  }
]



  // Ordenar por valor (opcional, tú decides si lo quieres fijo o dinámico)
  data.sort((a, b) => a.value - b.value)

  yAxis.data.setAll(data)
  series.data.setAll(data)
  sortCategoryAxis()

  // === Resto del código (sorting, animaciones, etc.) igual que antes ===
  function getSeriesItem(category) {
    for (let i = 0; i < series.dataItems.length; i++) {
      if (series.dataItems[i].get("categoryY") === category) {
        return series.dataItems[i]
      }
    }
  }

  chart.set("cursor", am5xy.XYCursor.new(root, { behavior: "none" }))

  function sortCategoryAxis() {
    series.dataItems.sort((a, b) => a.get("valueX") - b.get("valueX"))

    am5.array.each(yAxis.dataItems, (dataItem) => {
      const seriesDataItem = getSeriesItem(dataItem.get("category"))
      if (seriesDataItem) {
        const index = series.dataItems.indexOf(seriesDataItem)
        const deltaPosition = (index - dataItem.get("index", 0)) / series.dataItems.length
        dataItem.set("index", index)
        dataItem.set("deltaPosition", -deltaPosition)
        dataItem.animate({
          key: "deltaPosition",
          to: 0,
          duration: 1000,
          easing: am5.ease.out(am5.ease.cubic)
        })
      }
    })

    yAxis.dataItems.sort((a, b) => a.get("index") - b.get("index"))
  }

  series.appear(1000)
  chart.appear(1000, 100)
})

onBeforeUnmount(() => {
  if (root) root.dispose()
})
</script>

<style scoped>
#chartdivcasos {
  width: 100%;
  height: 450px;
  filter: drop-shadow(2px 5px 12px);
}
</style>