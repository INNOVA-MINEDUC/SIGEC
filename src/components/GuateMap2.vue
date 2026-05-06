<template>
  <div id="chartdiv" style="width: 100%; height: 600px;"></div>
</template>

<script setup>
import * as am5 from "@amcharts/amcharts5"
import * as am5map from "@amcharts/amcharts5/map"
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated"
import { onMounted, onBeforeUnmount } from "vue"

// 🗺️ Importa tus archivos GeoJSON locales
import guatemalaDepartamentos from "../helpers/Departamentos.json"
import guatemalaMunicipios from "../helpers/Municipios.json"

import guatemalaMunicipios2 from "../helpers/Municipios2.json"

let root

onMounted(() => {
  root = am5.Root.new("chartdiv")
    root._logo.dispose();
  root.setThemes([am5themes_Animated.new(root)])

  const chart = root.container.children.push(am5map.MapChart.new(root, {
    panX: "translateX",
    panY: "translateY",
    wheelX: "zoomX",
    wheelY: "zoomY",
    projection: am5map.geoMercator()
  }))

  const colors = am5.ColorSet.new(root, {})

  // Serie principal: Departamentos
  const departamentosSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {
    geoJSON: guatemalaDepartamentos
  }))

  departamentosSeries.mapPolygons.template.setAll({
    tooltipText: "{NAME_1}",
    interactive: true,
    fill: am5.color(6788316)
  })

  departamentosSeries.mapPolygons.template.states.create("hover", {
    fill: am5.color(6797276)
  })

  // Serie secundaria: Municipios
  const municipiosSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {
    visible: false
  }))

  municipiosSeries.mapPolygons.template.setAll({
    tooltipText: "{NAME_2}",
    interactive: true,
    fill: am5.color(6788316)
  })

  municipiosSeries.mapPolygons.template.states.create("hover", {
    fill: am5.color(6797276)
  })

  // Botón “Regresar”
  const backContainer = chart.children.push(am5.Container.new(root, {
    x: am5.p100,
    centerX: am5.p100,
    dx: -10,
    paddingTop: 5,
    paddingRight: 10,
    paddingBottom: 5,
    y: 30,
    layout: root.horizontalLayout,
    cursorOverStyle: "pointer",
    background: am5.RoundedRectangle.new(root, {
      fill: am5.color(0xffffff),
      fillOpacity: 0.2
    }),
    visible: false
  }))

  backContainer.children.push(am5.Label.new(root, {
    text: "🔙 Regresar",
    centerY: am5.p50
  }))

  // 📍 Evento click en departamento → zoom y carga municipios
  departamentosSeries.mapPolygons.template.events.on("click", (ev) => {
    const dataItem = ev.target.dataItem
    const name = dataItem.dataContext.NAME_1

    // Solo aplicar si tiene municipios en el JSON
    const filteredMunicipios = {
      type: "FeatureCollection",
      features: guatemalaMunicipios.features.filter(
        (f) => {
          return f.properties.NAME_1 === name
        } 
      )
    }

    // Zoom animado tipo amCharts
    const zoomAnimation = departamentosSeries.zoomToDataItem(dataItem)

    Promise.all([zoomAnimation.waitForStop()]).then(() => {
      municipiosSeries.set("geoJSON", filteredMunicipios)
      municipiosSeries.show()
      departamentosSeries.hide(100)
      backContainer.show()
    })
  })

  // 📍 Evento click en “Regresar” → volver con animación
  backContainer.events.on("click", () => {
    chart.goHome()
    departamentosSeries.show()
    municipiosSeries.hide()
    backContainer.hide()
  })
})

onBeforeUnmount(() => {
  if (root) root.dispose()
})
</script>
