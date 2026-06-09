import { useState } from 'react'
import { supabase } from './supabase'

const rawData = [
  { ciclo: 5, clave: "1IEE27", nombre: "Circuitos Eléctricos" },
  { ciclo: 5, clave: "1MTR50", nombre: "Representación Gráfica" },
  { ciclo: 5, clave: "1IEE28", nombre: "Sistemas Digitales B" },
  { ciclo: 5, clave: "ING212", nombre: "Dinámica" },
  { ciclo: 5, clave: "1EST22", nombre: "Probabilidad y Estadística" },
  { ciclo: 6, clave: "1IEE29", nombre: "Fund. y Aplic. de Electrónica" },
  { ciclo: 6, clave: "1MEC04", nombre: "Taller Procesos Fabricación" },
  { ciclo: 6, clave: "1MEC40", nombre: "Mecánica de Sólidos" },
  { ciclo: 6, clave: "1INF53", nombre: "Prog. Orientada a Objetos" },
  { ciclo: 6, clave: "1MTR53", nombre: "Robótica e IA" },
  { ciclo: 6, clave: "1MEC41", nombre: "Termofluidos A" },
  { ciclo: 7, clave: "1IEE30", nombre: "Electrotecnia Industrial" },
  { ciclo: 7, clave: "1MEC42", nombre: "Ingeniería Materiales A" },
  { ciclo: 7, clave: "1MEC45", nombre: "Tecnologías de Fabricación" },
  { ciclo: 7, clave: "1MTR54", nombre: "Sist. Dinámicos y Control A" },
  { ciclo: 7, clave: "1MEC43", nombre: "Elementos de Máquinas" },
  { ciclo: 7, clave: "1MTR55", nombre: "Automatización Industrial I A" },
  { ciclo: 8, clave: "1MTR57", nombre: "Sist. Dinámicos y Control B" },
  { ciclo: 8, clave: "IEE239", nombre: "Proc. Señales e Imágenes" },
  { ciclo: 8, clave: "MTR240", nombre: "Metodología Diseño Mecatrónico" },
  { ciclo: 8, clave: "1MTR56", nombre: "Automatización Industrial I B" },
  { ciclo: 8, clave: "1MEC44", nombre: "Lab. Diseño Mecánico" },
  { ciclo: 8, clave: "1MEC46", nombre: "Lab. Termo y Fluidos" },
  { ciclo: 8, clave: "MTR202", nombre: "Práctica Supervisada" },
  { ciclo: 9, clave: "1MTR01", nombre: "Trabajo Fin Carrera 1" },
  { ciclo: 9, clave: "1MTR52", nombre: "Proyecto Diseño Mecatrónico" },
  { ciclo: 9, clave: "1MTR58", nombre: "Biomecatrónica" },
  { ciclo: 9, clave: "ING220", nombre: "Etica Profesional" },
  { ciclo: 10, clave: "1MTR02", nombre: "Trabajo Fin Carrera 2" },
  { ciclo: 10, clave: "1IND44", nombre: "Gestión Empresarial" },
]

const cycles = [5, 6, 7, 8, 9, 10]

export default function CourseSelector({ studentId, onDone }) {
  const [selected, setSelected] = useState({})
  const [loading, setLoading] = useState(false)

  const toggle = (clave) => {
    setSelected(prev => ({ ...prev, [clave]: !prev[clave] }))
  }

  const save = async () => {
    setLoading(true)
    const completed = Object.entries(selected)
      .filter(([_, v]) => v)
      .map(([clave]) => ({
        student_id: studentId,
        course_clave: clave,
        status: 'completed'
      }))

    if (completed.length > 0) {
      await supabase.from('student_courses').upsert(completed)
    }

    setLoading(false)
    onDone(completed.map(c => c.course_clave))
  }

  const totalSelected = Object.values(selected).filter(Boolean).length

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-lg mx-auto">
        <div className="sticky top-0 bg-slate-50 pb-3 pt-1 z-10">
          <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">Mis cursos</h1>
          <p className="text-xs text-slate-400 mb-3">Marca todos los cursos que ya completaste</p>
          <button
            onClick={save}
            disabled={loading}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl transition-colors disabled:opacity-50">
            {loading ? 'Guardando...' : `Ver mi planificador (${totalSelected} cursos seleccionados)`}
          </button>
        </div>

        {cycles.map(ciclo => {
          const cursos = rawData.filter(c => c.ciclo === ciclo)
          return (
            <div key={ciclo} className="mb-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                Ciclo {ciclo}
              </p>
              <div className="space-y-2">
                {cursos.map(curso => (
                  <div
                    key={curso.clave}
                    onClick={() => toggle(curso.clave)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      selected[curso.clave]
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      selected[curso.clave]
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-slate-300'
                    }`}>
                      {selected[curso.clave] && (
                        <span className="text-white text-[10px] font-black">✓</span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-500">{curso.clave}</p>
                      <p className="text-sm font-bold text-slate-700 leading-tight">{curso.nombre}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}