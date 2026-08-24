<template>
  <div ref="chartdiv" id="chartdivmap"></div>
</template>

<script setup>
import * as am5 from "@amcharts/amcharts5"
import * as am5map from "@amcharts/amcharts5/map"
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated"
import { ref, onMounted, onBeforeUnmount, watch } from "vue"

import guatemalaDepartamentos from "../helpers/Departamentos2.json"
import guatemalaMunicipios from "../helpers/Municipios2.json"

import { useCasosStore } from "@/stores/casos"

const casosStore = useCasosStore()
const chartdiv = ref(null)
let root

// ── Escala de color (choropleth) ────────────────────────────────────────────
const COLOR_VACIO  = am5.color(0xeef2f7)   // 0 casos → gris muy claro
const COLOR_MIN    = am5.color(0xbcd0ec)   // pocos casos → azul claro
const COLOR_MAX    = am5.color(0x0b1b33)   // más casos → azul muy oscuro

const norm = (s) =>
  String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim()

// Departamento del caso: municipio→depto, o depto de residencia, o el departamental
const deptoDeCaso = (c) =>
  c.nina?.municipio?.departamento?.nombre ||
  c.nina?.departamento?.nombre ||
  c.departamental?.departamento?.nombre || null

const municipioDeCaso = (c) => c.nina?.municipio?.nombre || null

// Cuenta casos del store agrupados por el nombre que devuelve fn (normalizado)
const contarPor = (fn) => {
  const m = new Map()
  for (const c of casosStore.casos) {
    const n = norm(fn(c))
    if (n) m.set(n, (m.get(n) || 0) + 1)
  }
  return m
}

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
    tooltipText: "{departamen}: {casos} casos",
    interactive: true,
    fill: COLOR_VACIO,
    stroke: am5.color(0xffffff),
    strokeWidth: 0.5
  })
  departamentosSeries.mapPolygons.template.states.create("hover", {
    fill: am5.color(0x17c4e8)
  })

  const municipiosSeries = chart.series.push(
    am5map.MapPolygonSeries.new(root, { visible: false })
  )
  municipiosSeries.mapPolygons.template.setAll({
    tooltipText: "{municipio}: {casos} casos",
    interactive: true,
    fill: COLOR_VACIO,
    stroke: am5.color(0xffffff),
    strokeWidth: 0.5
  })
  municipiosSeries.mapPolygons.template.states.create("hover", {
    fill: am5.color(0x17c4e8)
  })

  const municipioSeleccionadoSeries = chart.series.push(
    am5map.MapPolygonSeries.new(root, { visible: false })
  )
  municipioSeleccionadoSeries.mapPolygons.template.setAll({
    tooltipText: "{municipio}: {casos} casos",
    interactive: true,
    fill: COLOR_VACIO,
    stroke: am5.color(0xffffff),
    strokeWidth: 0.5
  })
  municipioSeleccionadoSeries.mapPolygons.template.states.create("hover", {
    fill: am5.color(0x17c4e8)
  })

  // ── Leyenda de intensidad ──────────────────────────────────────────────────
  const heatLegend = chart.children.push(
    am5.HeatLegend.new(root, {
      orientation: "horizontal",
      startColor: COLOR_MIN,
      endColor: COLOR_MAX,
      startText: "Menos casos",
      endText: "Más casos",
      stepCount: 5,
      width: am5.percent(55),
      x: am5.p50,
      centerX: am5.p50,
      y: am5.percent(97),
      centerY: am5.p100
    })
  )

  // Pinta una serie según cuántos casos tiene cada polígono (choropleth).
  //   fn: cómo obtener el nombre del caso; campoGeo: propiedad del GeoJSON
  const pintarSerie = (series, fn, campoGeo) => {
    const counts = contarPor(fn)
    let max = 0
    counts.forEach((v) => { if (v > max) max = v })

    series.mapPolygons.each((poly) => {
      const ctx = poly.dataItem?.dataContext
      if (!ctx) return
      const nombre = ctx[campoGeo] ?? ctx.nombre
      const count = counts.get(norm(nombre)) || 0
      ctx.casos = count   // para el tooltip {casos}
      if (count <= 0) {
        poly.set("fill", COLOR_VACIO)
      } else {
        // 0.15 de piso para que 1 caso ya se distinga del vacío
        const t = max > 0 ? 0.15 + 0.85 * (count / max) : 0
        poly.set("fill", am5.Color.interpolate(t, COLOR_MIN, COLOR_MAX))
      }
    })

    heatLegend.set("startValue", 0)
    heatLegend.set("endValue", max)
  }

  // Repinta la serie que esté visible según el nivel de navegación actual.
  let vista = "nacional" // 'nacional' | 'departamento' | 'municipio'
  const repintarVisible = () => {
    if (vista === "nacional") pintarSerie(departamentosSeries, deptoDeCaso, "departamen")
    else if (vista === "departamento") pintarSerie(municipiosSeries, municipioDeCaso, "municipio")
    else pintarSerie(municipioSeleccionadoSeries, municipioDeCaso, "municipio")
  }

  // Cuando cada serie termina de dibujar sus polígonos, se pinta si es la visible.
  departamentosSeries.events.on("datavalidated", () => {
    if (vista === "nacional") pintarSerie(departamentosSeries, deptoDeCaso, "departamen")
  })
  municipiosSeries.events.on("datavalidated", () => {
    if (vista === "departamento") pintarSerie(municipiosSeries, municipioDeCaso, "municipio")
  })
  municipioSeleccionadoSeries.events.on("datavalidated", () => {
    if (vista === "municipio") pintarSerie(municipioSeleccionadoSeries, municipioDeCaso, "municipio")
  })

  // Cuando cambian los casos del store (carga inicial, drill-down, filtros) repinta.
  watch(() => casosStore.casos, repintarVisible, { deep: false })

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

    vista = "departamento"
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

    vista = "municipio"
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
      vista = "departamento"
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
      vista = "nacional"
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