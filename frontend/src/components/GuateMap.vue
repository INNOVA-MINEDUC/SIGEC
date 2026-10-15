<template>
  <div ref="chartdiv" id="chartdivmap"></div>
</template>

<script setup>
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { ref, onMounted, onBeforeUnmount, watch } from "vue";

import guatemalaDepartamentos from "../helpers/Departamentos2.json";

import { useCasosStore } from "@/stores/casos";
import { departamentoDeCaso } from "@/helpers/estadisticasCasos";
import {
  normGeo,
  poligonoDeCaso,
  poligonoDeMunicipio,
  featuresMunicipiosDe,
} from "@/helpers/mapaGeo";

// El dashboard controla los filtros y este componente dibuja el mapa.
const props = defineProps({
  departamento: {
    type: String,
    default: "",
  },
  municipio: {
    type: String,
    default: "",
  },
  bloquearDepartamento: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "seleccionar-departamento",
  "seleccionar-municipio",
  "regresar",
]);

const casosStore = useCasosStore();
const chartdiv = ref(null);

let root = null;
let rafId = null;
const detenerWatchers = [];

// ─────────────────────────────────────────────────────────────
// Colores del mapa
// ─────────────────────────────────────────────────────────────

const COLOR_VACIO = am5.color(0xdde4ee);
const COLOR_MIN = am5.color(0xbcd0ec);
const COLOR_MAX = am5.color(0x0b1b33);
const COLOR_BORDE = am5.color(0xffffff);
const COLOR_SELECCION = am5.color(0x17c4e8);
const COLOR_HOVER = am5.color(0x17c4e8);

const TEXTO_CLARO = am5.color(0xffffff);
const TEXTO_OSCURO = am5.color(0x10233f);

// ─────────────────────────────────────────────────────────────
// Contar casos por departamento o municipio
// ─────────────────────────────────────────────────────────────

const contarPor = (fn) => {
  const conteo = new Map();

  for (const caso of casosStore.casos) {
    const nombre = normGeo(fn(caso));

    if (nombre) {
      conteo.set(nombre, (conteo.get(nombre) || 0) + 1);
    }
  }

  return conteo;
};

onMounted(() => {
  if (!chartdiv.value) return;

  root = am5.Root.new(chartdiv.value);
  root._logo?.dispose();

  root.setThemes([am5themes_Animated.new(root)]);

  // ───────────────────────────────────────────────────────────
  // Configuración general del mapa
  // ───────────────────────────────────────────────────────────

  const chart = root.container.children.push(
    am5map.MapChart.new(root, {
      panX: "none",
      panY: "none",
      wheelX: "none",
      wheelY: "none",
      projection: am5map.geoMercator(),
      // Franja inferior reservada para la leyenda de intensidad: el mapa se
      // ajusta al área interior y la leyenda ya no tapa la costa sur cuando
      // el contenedor es más ancho que alto (tablet).
      paddingBottom: 56,
    })
  );

  // ───────────────────────────────────────────────────────────
  // Tooltip que toma el color del polígono
  // ───────────────────────────────────────────────────────────

  const crearTooltip = () => {
    const tooltip = am5.Tooltip.new(root, {
      getFillFromSprite: false,
      getLabelFillFromSprite: false,
      autoTextColor: false,
      pointerOrientation: "vertical",
    });

    tooltip.get("background").setAll({
      fill: COLOR_VACIO,
      fillOpacity: 0.97,
      stroke: COLOR_BORDE,
      strokeWidth: 1.5,
    });

    tooltip.label.setAll({
      fill: TEXTO_OSCURO,
      fontSize: 13,
      fontWeight: "600",
    });

    return tooltip;
  };

  // Configuración común de los polígonos (departamentos y municipios).
  const configurarPoligonos = (series, tooltipText) => {
    series.set("tooltip", crearTooltip());

    series.mapPolygons.template.setAll({
      tooltipText,
      interactive: true,
      cursorOverStyle: "pointer",
      fill: COLOR_VACIO,
      stroke: COLOR_BORDE,
      strokeWidth: 0.5,
      tooltipY: 0,
      stateAnimationDuration: 120,
    });

    // El hover solo resalta el borde para que se siga
    // viendo el color real del polígono.
    series.mapPolygons.template.states.create("hover", {
      stroke: COLOR_HOVER,
      strokeWidth: 2.5,
    });
  };

  // ───────────────────────────────────────────────────────────
  // Mapa de departamentos
  // ───────────────────────────────────────────────────────────

  const departamentosSeries = chart.series.push(
    am5map.MapPolygonSeries.new(root, {
      geoJSON: guatemalaDepartamentos,
    })
  );

  configurarPoligonos(departamentosSeries, "{departamen}: {casos} casos");

  // ───────────────────────────────────────────────────────────
  // Mapa de municipios
  // ───────────────────────────────────────────────────────────

  const municipiosSeries = chart.series.push(
    am5map.MapPolygonSeries.new(root, {
      visible: false,
    })
  );

  configurarPoligonos(municipiosSeries, "{municipio}: {casos} casos");

  // ───────────────────────────────────────────────────────────
  // Leyenda de intensidad
  // ───────────────────────────────────────────────────────────

  const heatLegend = chart.children.push(
    am5.HeatLegend.new(root, {
      orientation: "horizontal",
      startColor: COLOR_MIN,
      endColor: COLOR_MAX,
      startText: "Menos casos",
      endText: "Más casos",
      stepCount: 5,
      startValue: 0,
      endValue: 1,
      width: am5.percent(chartdiv.value.clientWidth < 500 ? 85 : 55),
      x: am5.p50,
      centerX: am5.p50,
      y: am5.p100,
      centerY: am5.p0,
      dy: 6,
    })
  );

  // ───────────────────────────────────────────────────────────
  // Etiqueta del total de casos
  // ───────────────────────────────────────────────────────────

  const totalLabel = chart.children.push(
    am5.Label.new(root, {
      text: "",
      x: 10,
      y: 10,
      fontSize: 14,
      fontWeight: "600",
      fill: TEXTO_OSCURO,
      background: am5.RoundedRectangle.new(root, {
        fill: am5.color(0xffffff),
        fillOpacity: 0.85,
      }),
      paddingTop: 6,
      paddingBottom: 6,
      paddingLeft: 10,
      paddingRight: 10,
    })
  );

  // ───────────────────────────────────────────────────────────
  // Botón para regresar
  // ───────────────────────────────────────────────────────────

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
        fillOpacity: 0.2,
      }),
      visible: false,
    })
  );

  backContainer.children.push(
    am5.Label.new(root, {
      text: "🔙 Regresar",
      centerY: am5.p50,
    })
  );

  // ───────────────────────────────────────────────────────────
  // Estado de navegación del mapa
  // ───────────────────────────────────────────────────────────

  let vista = "nacional";
  let deptosListos = false;
  let deptoCargado = null;

  const municipioSeleccionado = () => {
    return vista === "municipio"
      ? poligonoDeMunicipio(props.municipio, props.departamento)
      : null;
  };

  // ───────────────────────────────────────────────────────────
  // Pintar polígonos según la cantidad de casos
  // ───────────────────────────────────────────────────────────

  const pintarSerie = (series, obtenerNombre, campoGeo) => {
    const conteos = contarPor(obtenerNombre);
    const seleccionado = municipioSeleccionado();

    let maximo = 0;
    conteos.forEach((cantidad) => {
      if (cantidad > maximo) maximo = cantidad;
    });

    let ubicados = 0;

    series.mapPolygons.each((poligono) => {
      const contexto = poligono.dataItem?.dataContext;
      if (!contexto) return;

      const nombre = normGeo(contexto[campoGeo] ?? contexto.nombre);
      const cantidad = conteos.get(nombre) || 0;
      const esSeleccionado = seleccionado !== null && nombre === seleccionado;

      ubicados += cantidad;

      // Alimenta el tooltip "{...}: {casos} casos".
      contexto.casos = cantidad;

      // Color base según la cantidad de casos.
      let color = COLOR_VACIO;
      let intensidad = 0;

      if (cantidad > 0 && maximo > 0) {
        intensidad = 0.15 + 0.85 * (cantidad / maximo);
        color = am5.Color.interpolate(intensidad, COLOR_MIN, COLOR_MAX);
      }

      // Se guardan para usarlos en el hover.
      contexto.colorBase = color;
      contexto.colorTexto = intensidad > 0.5 ? TEXTO_CLARO : TEXTO_OSCURO;

      poligono.set("fill", color);

      // Borde especial para el municipio seleccionado.
      poligono.set("stroke", esSeleccionado ? COLOR_SELECCION : COLOR_BORDE);
      poligono.set("strokeWidth", esSeleccionado ? 3 : 0.5);

      if (esSeleccionado) {
        poligono.toFront();
      }
    });

    // Actualizar la leyenda (mínimo 1 para evitar división entre 0).
    heatLegend.set("startValue", 0);
    heatLegend.set("endValue", Math.max(maximo, 1));

    // Actualizar el total mostrado.
    const total = casosStore.casos.length;
    const sinUbicar = total - ubicados;
    const nivel = vista === "nacional" ? "departamento" : "municipio";

    totalLabel.set(
      "text",
      `Total: ${total} casos` +
        (sinUbicar > 0 ? ` · ${sinUbicar} sin ${nivel} registrado` : "")
    );
  };

  // ───────────────────────────────────────────────────────────
  // Repintar el mapa que está visible
  // ───────────────────────────────────────────────────────────

  const repintarVisible = () => {
    if (!root) return;

    if (vista === "nacional") {
      pintarSerie(departamentosSeries, departamentoDeCaso, "departamen");
    } else {
      pintarSerie(municipiosSeries, poligonoDeCaso, "municipio");
    }
  };

  // Agrupa varios repintados seguidos en uno solo por frame.
  const programarRepintado = () => {
    if (rafId) cancelAnimationFrame(rafId);

    rafId = requestAnimationFrame(() => {
      rafId = null;
      repintarVisible();
    });
  };

  // ───────────────────────────────────────────────────────────
  // Hover: tooltip con el color del polígono + indicador en leyenda
  // ───────────────────────────────────────────────────────────

  const registrarHover = (series) => {
    series.mapPolygons.template.events.on("pointerover", (evento) => {
      const contexto = evento.target.dataItem?.dataContext;
      if (!contexto) return;

      const cantidad = contexto.casos || 0;
      const color = contexto.colorBase || COLOR_VACIO;
      const texto = contexto.colorTexto || TEXTO_OSCURO;

      const tooltip = series.get("tooltip");
      if (tooltip) {
        tooltip.get("background").set("fill", color);
        tooltip.label.set("fill", texto);
      }

      heatLegend.showValue(cantidad, `${cantidad} casos`);
    });

    series.mapPolygons.template.events.on("pointerout", () => {
      heatLegend.getTooltip()?.hide();
    });
  };

  registrarHover(departamentosSeries);
  registrarHover(municipiosSeries);

  // ───────────────────────────────────────────────────────────
  // Buscar el departamento seleccionado
  // ───────────────────────────────────────────────────────────

  const dataItemDepartamento = () => {
    const departamento = normGeo(props.departamento);
    if (!departamento) return null;

    return (
      departamentosSeries.dataItems.find(
        (item) => normGeo(item.dataContext?.departamen) === departamento
      ) || null
    );
  };

  // ───────────────────────────────────────────────────────────
  // Aplicar selección de departamento y municipio
  // ───────────────────────────────────────────────────────────

  const aplicarSeleccion = () => {
    if (!root || !deptosListos) return;

    heatLegend.getTooltip()?.hide();

    const dataItem = dataItemDepartamento();

    // Sin departamento: vista nacional.
    if (!dataItem) {
      vista = "nacional";
      deptoCargado = null;

      municipiosSeries.hide();
      departamentosSeries.show();

      backContainer.hide();
      chart.goHome();

      programarRepintado();
      return;
    }

    vista = props.municipio ? "municipio" : "departamento";

    if (vista === "municipio" || !props.bloquearDepartamento) {
      backContainer.show();
    } else {
      backContainer.hide();
    }

    // Encuadrar el departamento completo.
    departamentosSeries.zoomToDataItem(dataItem);

    const departamento = normGeo(props.departamento);

    // Cargar los municipios solo cuando cambia el departamento.
    // El repintado lo hace el evento "datavalidated".
    if (deptoCargado !== departamento) {
      deptoCargado = departamento;

      municipiosSeries.set("geoJSON", {
        type: "FeatureCollection",
        features: featuresMunicipiosDe(props.departamento),
      });

      municipiosSeries.show();
      departamentosSeries.hide(100);
      return;
    }

    municipiosSeries.show();
    departamentosSeries.hide(100);

    programarRepintado();
  };

  // ───────────────────────────────────────────────────────────
  // Eventos de carga de las series
  // ───────────────────────────────────────────────────────────

  departamentosSeries.events.on("datavalidated", () => {
    if (!deptosListos) {
      deptosListos = true;
      aplicarSeleccion();
      return;
    }

    if (vista === "nacional") {
      programarRepintado();
    }
  });

  municipiosSeries.events.on("datavalidated", () => {
    if (vista !== "nacional") {
      programarRepintado();
    }
  });

  // ───────────────────────────────────────────────────────────
  // Clics
  // ───────────────────────────────────────────────────────────

  departamentosSeries.mapPolygons.template.events.on("click", (evento) => {
    const nombre = evento.target.dataItem?.dataContext?.departamen;
    if (nombre) emit("seleccionar-departamento", nombre);
  });

  municipiosSeries.mapPolygons.template.events.on("click", (evento) => {
    const nombre = evento.target.dataItem?.dataContext?.municipio;
    if (nombre) emit("seleccionar-municipio", nombre);
  });

  backContainer.events.on("click", () => {
    emit("regresar");
  });

  // ───────────────────────────────────────────────────────────
  // Watchers (se guardan para detenerlos al desmontar)
  // ───────────────────────────────────────────────────────────

  detenerWatchers.push(
    watch(
      () => [props.departamento, props.municipio, props.bloquearDepartamento],
      aplicarSeleccion
    )
  );

  detenerWatchers.push(
    watch(() => casosStore.casos, programarRepintado, { deep: false })
  );
});

// ─────────────────────────────────────────────────────────────
// Liberar recursos al desmontar el componente
// ─────────────────────────────────────────────────────────────

onBeforeUnmount(() => {
  detenerWatchers.forEach((detener) => detener());
  detenerWatchers.length = 0;

  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  if (root) {
    root.dispose();
    root = null;
  }
});
</script>

<style scoped>
#chartdivmap {
  width: 100%;
  height: 650px;
  /* Se quitó filter: drop-shadow(...) porque hacía que el mapa se trabara. */
}

/* Una sola columna (tablet vertical): ancho de sobra, se acota la altura */
@media (max-width: 900px) {
  #chartdivmap {
    height: 540px;
  }
}

@media (max-width: 700px) {
  #chartdivmap {
    height: 440px;
  }
}
</style>