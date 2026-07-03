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

// Soporta tanto { municipio, departamento } como { nombre, departamento }
const catalogo = data.map(item => ({
    ...item,
    municipioBusqueda: normalizar(item.municipio ?? item.nombre),
    departamentoBusqueda: normalizar(item.departamento)
}));

// Lista única de departamentos (sin duplicar por cada municipio)
const departamentosUnicos = Array.from(
    new Map(
        catalogo.map(item => [
            item.departamentoBusqueda,
            { departamento: item.departamento, departamentoBusqueda: item.departamentoBusqueda }
        ])
    ).values()
);

const fuseDepartamento = new Fuse(departamentosUnicos, {
    keys: ["departamentoBusqueda"],
    threshold: 0.35,
    includeScore: true
});

// Cache de instancias Fuse por departamento, para no recrearlas en cada búsqueda
const fuseMunicipioPorDepartamento = new Map();

function getFuseMunicipio(departamentoBusqueda) {
    if (fuseMunicipioPorDepartamento.has(departamentoBusqueda)) {
        return fuseMunicipioPorDepartamento.get(departamentoBusqueda);
    }

    const municipiosDelDepartamento = catalogo.filter(
        item => item.departamentoBusqueda === departamentoBusqueda
    );

    const fuse = new Fuse(municipiosDelDepartamento, {
        keys: ["municipioBusqueda"],
        threshold: 0.35,
        includeScore: true
    });

    fuseMunicipioPorDepartamento.set(departamentoBusqueda, fuse);
    return fuse;
}

export function validarUbicacion(departamento, municipio) {
    // 1. Primero resolvemos el departamento
    const resultadoDepartamento = fuseDepartamento.search(normalizar(departamento));

    if (resultadoDepartamento.length === 0) {
        return { municipio: null, departamento: null };
    }

    const departamentoEncontrado = resultadoDepartamento[0].item;

    // 2. Buscamos el municipio SOLO dentro de ese departamento
    const fuseMunicipio = getFuseMunicipio(departamentoEncontrado.departamentoBusqueda);
    const resultadoMunicipio = fuseMunicipio.search(normalizar(municipio));

    return {
        municipio: resultadoMunicipio.length > 0 ? resultadoMunicipio[0].item : null,
        departamento: departamentoEncontrado
    };
}

const dato = validarUbicacion(
    "chiquimula",
    "Olapa"
);

console.log("Departamento:", dato.departamento?.departamento ?? "No encontrado");
console.log("Municipio:", dato.municipio?.municipio ?? dato.municipio?.nombre ?? "No encontrado");