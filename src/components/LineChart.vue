<template>
  <div id="chartdivline"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, computed, watch } from "vue";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { useCasosStore } from '@/stores/casos'

const casosStore = useCasosStore()



let root;

onMounted(() => {
  root = am5.Root.new("chartdivline");
  root._logo.dispose()

  root.setThemes([am5themes_Animated.new(root)]);

  // Crear chart
  let chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: true,
      panY: true,
      wheelX: "panX",
      wheelY: "zoomX",
      pinchZoomX: true,
      paddingLeft: 0,
      paddingRight: 1
    })
  );

  // Cursor
  let cursor = chart.set("cursor", am5xy.XYCursor.new(root, {}));
  cursor.lineY.set("visible", false);

  // Axis X
  let xRenderer = am5xy.AxisRendererX.new(root, {
    minGridDistance: 30,
    minorGridEnabled: true
  });

  xRenderer.labels.template.setAll({
    rotation: -90,
    centerY: am5.p50,
    centerX: am5.p100,
    paddingRight: 15
  });

  xRenderer.grid.template.setAll({ location: 1 });

  let xAxis = chart.xAxes.push(
    am5xy.CategoryAxis.new(root, {
      maxDeviation: 0.3,
      categoryField: "month",
      renderer: xRenderer,
      tooltip: am5.Tooltip.new(root, {})
    })
  );

  // Axis Y
  let yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      maxDeviation: 0.3,
      renderer: am5xy.AxisRendererY.new(root, { strokeOpacity: 0.1 })
    })
  );

  // Serie
  let series = chart.series.push(
    am5xy.ColumnSeries.new(root, {
      name: "Series 1",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "value",
      categoryXField: "month",
      sequencedInterpolation: true,
      tooltip: am5.Tooltip.new(root, { labelText: "{valueY}" })
    })
  );

  series.columns.template.setAll({
    cornerRadiusTL: 5,
    cornerRadiusTR: 5,
    strokeOpacity: 0,
    fill: am5.color("#6794DC"),   // 🎨 COLOR CELESTE
    stroke: am5.color("#6794DC")
  });


 // Datos con los meses del año
const data = [
  { month: "Enero", value: casosStore.casosPorMes(1).length },
  { month: "Febrero", value: casosStore.casosPorMes(2).length },
  { month: "Marzo", value: casosStore.casosPorMes(3).length },
  { month: "Abril", value: casosStore.casosPorMes(4).length },
  { month: "Mayo", value: casosStore.casosPorMes(5).length },
  { month: "Junio", value: casosStore.casosPorMes(6).length },
  { month: "Julio", value: casosStore.casosPorMes(7).length },
  { month: "Agosto", value: casosStore.casosPorMes(8).length },
  { month: "Septiembre", value: casosStore.casosPorMes(9).length },
  { month: "Octubre", value: casosStore.casosPorMes(10).length },
  { month: "Noviembre", value: casosStore.casosPorMes(11).length },
  { month: "Diciembre", value: casosStore.casosPorMes(12).length }
]




  xAxis.data.setAll(data);
  series.data.setAll(data);

  // Animación
  series.appear(1000);
  chart.appear(1000, 100);
});

onBeforeUnmount(() => {
  if (root) root.dispose();
});
</script>

<style scoped>
#chartdivline {
  width: 100%;
  height: 400px;
  filter: drop-shadow(2px 6px 12px);
}
</style>
