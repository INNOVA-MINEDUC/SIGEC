import Fuse from "fuse.js";
import data from "./data.json" with { type: "json" };

function normalizar(texto = "") {
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
}

/**
 * Normalizamos todo el catálogo una sola vez
 */
const catalogo = data.map(item => ({
    ...item,

    // Nombre original
    nombreOriginal: item.nombre,
    departamentoOriginal: item.departamento,

    // Nombre normalizado
    nombre: normalizar(item.nombre),

    // Alias normalizados
    alias: (item.alias ?? []).map(normalizar),

    // Departamento normalizado
    departamento: normalizar(item.departamento)
}));

/**
 * Fuse únicamente para municipios
 */
const fuseMunicipios = new Fuse(catalogo, {
    keys: [
        "nombre",
        "alias"
    ],
    threshold: 0.30,
    includeScore: true,
    ignoreLocation: true
});

/**
 * Busca un municipio y devuelve también su departamento
 */
export function buscarMunicipio(texto) {

    const busqueda = normalizar(texto);

    const resultado = fuseMunicipios.search(busqueda);

    if (!resultado.length) {
        return null;
    }

    const municipio = resultado[0].item;

    return {
        id: municipio.id,
        municipio: municipio.nombreOriginal,
        departamento: municipio.departamentoOriginal,
        score: resultado[0].score
    };
}


/* ===========================
        PRUEBAS
=========================== */

console.log(buscarMunicipio("coban"));

console.log(buscarMunicipio("Cobán"));

console.log(buscarMunicipio("olapas"));

console.log(buscarMunicipio("San Jose Pinula"));

console.log(buscarMunicipio("san jose pínula"));

console.log(buscarMunicipio("Mixco"));