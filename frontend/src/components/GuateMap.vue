<template>
  <div ref="chartdiv" id="chartdivmap"></div>
</template>

<script setup>
import * as am5 from "@amcharts/amcharts5"
import * as am5map from "@amcharts/amcharts5/map"
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated"
import { ref, onMounted, onBeforeUnmount } from "vue"

import guatemalaDepartamentos from "../helpers/Departamentos2.json"
import guatemalaMunicipios from "../helpers/Municipios2.json"

import { useCasosStore } from "@/stores/casos"

const casosStore = useCasosStore()
const chartdiv = ref(null)
let root

onMounted(() => {
  root = am5.Root.new(chartdiv.value)
  root._logo.dispose()
  root.setThemes([am5themes_Animated.new(root)])

  const chart = root.container.children.push(
    am5map.MapChart.new(root, {
      panX: "translateX",
      panY: "translateY",
      wheelX: "zoomX",
      wheelY: "zoomY",
      projection: am5map.geoMercator()
    })
  )

  const departamentosSeries = chart.series.push(
    am5map.MapPolygonSeries.new(root, { geoJSON: guatemalaDepartamentos })
  )
  departamentosSeries.mapPolygons.template.setAll({
    tooltipText: "{departamen}",
    interactive: true,
    fill: am5.color("#ff7b7b")
  })
  departamentosSeries.mapPolygons.template.states.create("hover", {
    fill: am5.color("#ffb3b3")
  })

  const municipiosSeries = chart.series.push(
    am5map.MapPolygonSeries.new(root, { visible: false })
  )
  municipiosSeries.mapPolygons.template.setAll({
    tooltipText: "{municipio}",
    interactive: true,
    fill: am5.color("#ffb3b3")
  })
  municipiosSeries.mapPolygons.template.states.create("hover", {
    fill: am5.color("#ff7b7b")
  })

  const municipioSeleccionadoSeries = chart.series.push(
    am5map.MapPolygonSeries.new(root, { visible: false })
  )
  municipioSeleccionadoSeries.mapPolygons.template.setAll({
    tooltipText: "{municipio}",
    interactive: true,
    fill: am5.color("#ffb3b3")
  })
  municipioSeleccionadoSeries.mapPolygons.template.states.create("hover", {
    fill: am5.color("#ff7b7b")
  })

  const backContainer = chart.children.push(
    am5.Container.new(root, {
      x: am5.p100,
      centerX: am5.p100,
      dx: -10,
      y: 30,
      layout: root.horizontalLayout,
      cursorOverStyle: "pointer",
      background: am5.RoundedRectangle.new(root, {
        fill: am5.color(0xffffff),
        fillOpacity: 0.2
      }),
      visible: false
    })
  )
  backContainer.children.push(
    am5.Label.new(root, { text: "🔙 Regresar", centerY: am5.p50 })
  )

  let lastDepartamentoDataItem = null
  let lastDepartamentoNombre = null

  // ─── Click departamento ────────────────────────────────────────────────────
  departamentosSeries.mapPolygons.template.events.on("click", (ev) => {
    const dataItem = ev.target.dataItem
    const data = dataItem.dataContext

    const deptNombre = data.departamen ?? data.nombre
    lastDepartamentoDataItem = dataItem
    lastDepartamentoNombre = deptNombre

    console.log("[MAPA] Departamento:", deptNombre)

    casosStore.fetchPorDepartamento(deptNombre).then(() => {
      console.log(`[STORE] Total casos (${deptNombre}):`, casosStore.total)
      console.log("[STORE] Datos:", casosStore.casos)
    })

    const filtered = guatemalaMunicipios.features.filter((f) => {
      return f?.properties?.departamen?.trim().toLowerCase() === deptNombre.trim().toLowerCase()
    })

    if (filtered.length === 0) {
      console.warn("[MAPA] Sin municipios para:", deptNombre)
      return
    }

    departamentosSeries.zoomToDataItem(dataItem).waitForStop().then(() => {
      municipiosSeries.set("geoJSON", { type: "FeatureCollection", features: filtered })
      municipiosSeries.show()
      departamentosSeries.hide(100)
      backContainer.show()
    })
  })

  // ─── Click municipio ───────────────────────────────────────────────────────
  municipiosSeries.mapPolygons.template.events.on("click", (ev) => {
    const dataItem = ev.target.dataItem
    const data = dataItem.dataContext

    const munNombre = data.municipio ?? data.nombre
    const deptNombre = lastDepartamentoNombre

    console.log("[MAPA] Municipio:", munNombre, "| Departamento:", deptNombre)

    casosStore.fetchPorMunicipio(munNombre, deptNombre).then(() => {
      console.log(`[STORE] Total casos (${munNombre}):`, casosStore.total)
      console.log("[STORE] Datos:", casosStore.casos)
    })

    const filtered = guatemalaMunicipios.features.filter((f) => {
      return f?.properties?.municipio?.trim().toLowerCase() === munNombre.trim().toLowerCase()
    })

    municipiosSeries.zoomToDataItem(dataItem).waitForStop().then(() => {
      municipioSeleccionadoSeries.set("geoJSON", { type: "FeatureCollection", features: filtered })
      municipioSeleccionadoSeries.show()
      municipiosSeries.hide(100)
      backContainer.show()
    })
  })

  // ─── Botón regresar ────────────────────────────────────────────────────────
  backContainer.events.on("click", () => {
    if (municipioSeleccionadoSeries.get("visible")) {
      // Municipio → departamento
      municipioSeleccionadoSeries.hide()
      municipiosSeries.show()

      if (lastDepartamentoDataItem) {
        departamentosSeries.zoomToDataItem(lastDepartamentoDataItem)
      }

      console.log("[MAPA] Regresando a departamento:", lastDepartamentoNombre)
      casosStore.fetchPorDepartamento(lastDepartamentoNombre).then(() => {
        console.log(`[STORE] Total casos (${lastDepartamentoNombre}):`, casosStore.total)
      })

    } else {
      // Departamento → nacional
      chart.goHome()
      departamentosSeries.show()
      municipiosSeries.hide()
      backContainer.hide()

      lastDepartamentoDataItem = null
      lastDepartamentoNombre = null

      console.log("[MAPA] Regresando a vista nacional")
      casosStore.fetchTodos().then(() => {
        console.log("[STORE] Total casos (todos):", casosStore.total)
      })
    }
  })

  // ─── Carga inicial ─────────────────────────────────────────────────────────
  casosStore.fetchTodos().then(() => {
    console.log("[STORE] Carga inicial. Total:", casosStore.total)
    console.log("[STORE] Datos:", casosStore.casos)
  })
})

onBeforeUnmount(() => {
  if (root) root.dispose()
})
</script>

<style scoped>
#chartdivmap {
  width: 100%;
  height: 650px;
  filter: drop-shadow(2px 20px 12px);
}
</style>