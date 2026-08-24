/**
 * useStatCards — Composable
 * Datos compartidos de stat cards usados en HomeView y Seguimiento.
 */

import iconFootprintsPink  from '@/assets/ninas_embarazadas_-20.png'
import iconFootprintsWhite from '@/assets/ninas_embarazadas_-13.png'
import iconClipboardPink   from '@/assets/ninas_embarazadas_-19.png'
import iconClipboardWhite  from '@/assets/ninas_embarazadas_-14.png'
import iconGraduationPink  from '@/assets/ninas_embarazadas_-18.png'
import iconGraduationWhite from '@/assets/ninas_embarazadas_-15.png'
import iconBuildingPink    from '@/assets/ninas_embarazadas_-17.png'
import iconBuildingWhite   from '@/assets/ninas_embarazadas_-16.png'

export function useStatCards() {
  const statCards = [
    { label: 'Casos totales',     value: '17', pink: iconFootprintsPink,  white: iconFootprintsWhite },
    { label: 'En seguimiento',    value: '06', pink: iconClipboardPink,   white: iconClipboardWhite },
    { label: 'Aún estudiando',    value: '06', pink: iconGraduationPink,  white: iconGraduationWhite },
    { label: 'Fuera del sistema', value: '05', pink: iconBuildingPink,    white: iconBuildingWhite }
  ]

  return { statCards }
}
