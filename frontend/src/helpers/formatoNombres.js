// Formato de presentación de nombres geográficos (departamentos y municipios).
//
// El catálogo de la BD guarda los nombres en minúsculas ("alta verapaz",
// "petén"). Para mostrarlos y exportarlos se usa la forma oficial con
// mayúscula inicial ("Alta Verapaz", "Petén", "El Progreso"), conservando
// tildes y sin modificar el valor guardado. Como en la nomenclatura oficial,
// las preposiciones intermedias quedan en minúscula ("San José del Golfo",
// "Santa María de Jesús") y los artículos se escriben con mayúscula
// ("San Antonio La Paz", "Santa Catalina La Tinta").
const CONECTORES = new Set(['de', 'del', 'y', 'e'])

export function formatearNombreGeografico(nombre) {
  const texto = String(nombre ?? '').trim().replace(/\s+/g, ' ')
  if (!texto) return ''
  return texto
    .toLocaleLowerCase('es')
    .split(' ')
    .map((palabra, i) =>
      i > 0 && CONECTORES.has(palabra)
        ? palabra
        : palabra.charAt(0).toLocaleUpperCase('es') + palabra.slice(1)
    )
    .join(' ')
}
