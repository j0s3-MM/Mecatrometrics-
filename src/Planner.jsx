import { useState, useMemo } from 'react'

const rawData = [
  { ciclo: 5, clave: "1IEE27", nombre: "Circuitos Eléctricos", reqs: ["1FIS06", "1FIS07"], creditos: 4.00 },
  { ciclo: 5, clave: "1MTR50", nombre: "Representación Gráfica", reqs: ["1ING02"], creditos: 3.50 },
  { ciclo: 5, clave: "1IEE28", nombre: "Sistemas Digitales B", reqs: ["1IEE04", "1INF01", "ING693"], creditos: 5.00 },
  { ciclo: 5, clave: "ING212", nombre: "Dinámica", reqs: ["ING693", "1MAT09"], creditos: 5.00 },
  { ciclo: 5, clave: "1EST22", nombre: "Probabilidad y Estadística", reqs: ["1MAT09"], creditos: 3.50 },
  { ciclo: 6, clave: "1IEE29", nombre: "Fund. y Aplic. de Electrónica", reqs: ["1IEE27", "[1MTR50]"], creditos: 4.00 },
  { ciclo: 6, clave: "1MEC04", nombre: "Taller Procesos Fabricación", reqs: ["[1MTR50]"], creditos: 2.00 },
  { ciclo: 6, clave: "1MEC40", nombre: "Mecánica de Sólidos", reqs: ["ING693", "1MAT08", "[1MTR50]"], creditos: 4.00 },
  { ciclo: 6, clave: "1INF53", nombre: "Prog. Orientada a Objetos", reqs: ["[1IEE28]", "1INF01", "[1MTR53]"], creditos: 5.00 },
  { ciclo: 6, clave: "1MTR53", nombre: "Robótica e IA", reqs: ["ING212", "1EST22", "[1IEE29]"], creditos: 3.00 },
  { ciclo: 6, clave: "1MEC41", nombre: "Termofluidos A", reqs: ["1FIS04", "1FIS05", "1MAT08"], creditos: 4.50 },
  { ciclo: 7, clave: "1IEE30", nombre: "Electrotecnia Industrial", reqs: ["1IEE28", "1IEE29"], creditos: 3.00 },
  { ciclo: 7, clave: "1MEC42", nombre: "Ingeniería Materiales A", reqs: ["[1MEC40]"], creditos: 4.00 },
  { ciclo: 7, clave: "1MEC45", nombre: "Tecnologías de Fabricación", reqs: ["1MEC04", "1MEC40"], creditos: 3.50 },
  { ciclo: 7, clave: "1MTR54", nombre: "Sist. Dinámicos y Control A", reqs: ["ING212", "1MEC41", "[1IEE29]"], creditos: 4.00 },
  { ciclo: 7, clave: "1MEC43", nombre: "Elementos de Máquinas", reqs: ["1MEC04", "1MEC40", "1MTR53", "[1MTR54]"], creditos: 5.00 },
  { ciclo: 7, clave: "1MTR55", nombre: "Automatización Industrial I A", reqs: ["[1MTR54]", "1INF53"], creditos: 3.00 },
  { ciclo: 8, clave: "1MTR57", nombre: "Sist. Dinámicos y Control B", reqs: ["1MTR54", "[IEE239]"], creditos: 4.00 },
  { ciclo: 8, clave: "IEE239", nombre: "Proc. Señales e Imágenes", reqs: ["1MTR53", "1IEE30"], creditos: 4.00 },
  { ciclo: 8, clave: "MTR240", nombre: "Metodología Diseño Mecatrónico", reqs: ["1MEC43", "1MTR54", "[1MTR55]"], creditos: 3.00 },
  { ciclo: 8, clave: "1MTR56", nombre: "Automatización Industrial I B", reqs: ["1MTR55","1MEC45","1IEE30","[1MEC46]"], creditos: 4.00 },
  { ciclo: 8, clave: "1MEC44", nombre: "Lab. Diseño Mecánico", reqs: ["[1MEC43]", "1MEC42"], creditos: 1.00 },
  { ciclo: 8, clave: "1MEC46", nombre: "Lab. Termo y Fluidos", reqs: ["1MEC41"], creditos: 1.00 },
  { ciclo: 8, clave: "MTR202", nombre: "Práctica Supervisada", reqs: ["150 Créditos"], creditos: 0.50 },
  { ciclo: 9, clave: "1MTR01", nombre: "Trabajo Fin Carrera 1", reqs: ["MTR240", "1MTR55"], creditos: 3.00 },
  { ciclo: 9, clave: "1MTR52", nombre: "Proyecto Diseño Mecatrónico", reqs: ["MTR240", "[1MTR56]", "[1MTR57]", "1MEC44"], creditos: 4.50 },
  { ciclo: 9, clave: "1MTR58", nombre: "Biomecatrónica", reqs: ["1MTR54", "1MEC43", "[1MTR57]"], creditos: 3.00 },
  { ciclo: 9, clave: "ING220", nombre: "Etica Profesional", reqs: ["120 Créditos"], creditos: 2.00 },
  { ciclo: 10, clave: "1MTR02", nombre: "Trabajo Fin Carrera 2", reqs: ["1MTR52", "1MTR01", "1MTR56", "[1MTR58]"], creditos: 3.00 },
  { ciclo: 10, clave: "1IND44", nombre: "Gestión Empresarial", reqs: ["120 Créditos"], creditos: 3.50 },
]

const categoryColors = {
  "ING": { stroke: "#059669", bg: "#ecfdf5", text: "#065f46" },
  "IEE": { stroke: "#e11d48", bg: "#fff1f2", text: "#9f1239" },
  "INF": { stroke: "#2563eb", bg: "#eff6ff", text: "#1e40af" },
  "MEC": { stroke: "#ea580c", bg: "#fff7ed", text: "#9a3412" },
  "MTR": { stroke: "#7c3aed", bg: "#f5f3ff", text: "#5b21b6" },
  "EST": { stroke: "#4b5563", bg: "#f3f4f6", text: "#1f2937" },
  "IND": { stroke: "#db2777", bg: "#fdf2f8", text: "#9d174d" },
  "DEFAULT": { stroke: "#94a3b8", bg: "#f8fafc", text: "#475569" }
}

const cleanReq = r => r.replace(/[\[\]\(\)]/g, '').trim()

export default function Planner({ completedCourses, studentName, onEditCourses }) {
  const [selectedNode, setSelectedNode] = useState(null)

  const nodeWidth = 170
  const nodeHeight = 82
  const cycleGap = 100
  const cycles = [5, 6, 7, 8, 9, 10]

  const getCategory = (clave) => {
    const prefix = clave.match(/[A-Z]+/)?.[0]
    return categoryColors[prefix] ? prefix : "DEFAULT"
  }

  const getCoordinates = (clave) => {
    const node = rawData.find(n => n.clave === clave)
    if (!node) return null
    const cycleIdx = cycles.indexOf(node.ciclo)
    const nodesInCycle = rawData.filter(n => n.ciclo === node.ciclo)
    const nodeIdx = nodesInCycle.findIndex(n => n.clave === clave)
    return {
      x: cycleIdx * (nodeWidth + cycleGap) + 80,
      y: nodeIdx * (nodeHeight + 25) + 110
    }
  }

  // Calcular estado de cada curso
  const courseStatus = useMemo(() => {
    const status = {}
    rawData.forEach(node => {
      if (completedCourses.includes(node.clave)) {
        status[node.clave] = 'completed'
        return
      }
      // Verificar si prereqs directos están cumplidos
      const hardReqs = node.reqs
        .filter(r => !r.startsWith('['))
        .map(cleanReq)
        .filter(r => rawData.find(n => n.clave === r)) // solo los que están en el plan

      const allMet = hardReqs.every(r => completedCourses.includes(r))
      status[node.clave] = allMet ? 'available' : 'locked'
    })
    return status
  }, [completedCourses])

  const getNodeStyle = (clave) => {
    const s = courseStatus[clave]
    const cat = getCategory(clave)
    const colors = categoryColors[cat]
    if (s === 'completed') return { fill: '#f0fdf4', stroke: '#22c55e', strokeWidth: 2.5 }
    if (s === 'available') return { fill: colors.bg, stroke: colors.stroke, strokeWidth: 2 }
    return { fill: '#f8fafc', stroke: '#e2e8f0', strokeWidth: 1 }
  }

  const getStatusBadge = (clave) => {
    const s = courseStatus[clave]
    if (s === 'completed') return { label: '✓ LISTO', color: '#22c55e' }
    if (s === 'available') return { label: '► PUEDES', color: '#7c3aed' }
    return null
  }

  const availableCount = Object.values(courseStatus).filter(s => s === 'available').length
  const completedCount = completedCourses.length

  return (
    <div className="w-full h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 bg-white border-b shadow-sm z-10 flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter leading-none">Mecatrométrics</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
            Hola, {studentName} · {completedCount} completados · {availableCount} disponibles
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex gap-3 text-[10px] font-bold">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span> Completado</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span> Disponible</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block"></span> Bloqueado</span>
          </div>
          <button onClick={onEditCourses}
            className="px-3 py-1.5 rounded-lg border-2 text-[11px] font-black uppercase border-slate-200 text-slate-400 hover:border-slate-800 hover:text-slate-800 transition-all">
            ✏️ Editar
          </button>
        </div>
      </div>

      {/* Grafo */}
      <div className="flex-1 overflow-auto" style={{background: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '25px 25px'}}>
        <svg width={cycles.length * (nodeWidth + cycleGap) + 200} height={900} className="mx-auto">
          <defs>
            {Object.entries(categoryColors).map(([key, val]) => (
              <marker key={key} id={`arrow-${key}`} markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill={val.stroke} />
              </marker>
            ))}
          </defs>

          {/* Columnas */}
          {cycles.map((c, i) => (
            <g key={`cyc-${c}`}>
              <rect x={i * (nodeWidth + cycleGap) + 65} y={85} width={nodeWidth + 30} height={780} rx="16" fill="white" fillOpacity="0.5" stroke="#f1f5f9" />
              <text x={i * (nodeWidth + cycleGap) + 80 + nodeWidth/2} y={75} textAnchor="middle" fontSize="12" fontWeight="900" fill="#94a3b8">Ciclo {c}</text>
            </g>
          ))}

          {/* Líneas */}
          {rawData.map(node => node.reqs.map(reqRaw => {
            const sourceClave = cleanReq(reqRaw)
            const source = getCoordinates(sourceClave)
            const target = getCoordinates(node.clave)
            if (!source || !target) return null
            const isCompleted = courseStatus[sourceClave] === 'completed'
            return (
              <path
                key={`${sourceClave}-${node.clave}`}
                d={`M ${source.x + nodeWidth} ${source.y + nodeHeight/2} C ${source.x + nodeWidth + cycleGap/2} ${source.y + nodeHeight/2}, ${target.x - cycleGap/2} ${target.y + nodeHeight/2}, ${target.x} ${target.y + nodeHeight/2}`}
                fill="none"
                stroke={isCompleted ? '#22c55e' : '#e2e8f0'}
                strokeWidth={isCompleted ? 2 : 1}
                strokeDasharray={reqRaw.startsWith('[') ? "4,4" : "0"}
                markerEnd={`url(#arrow-${getCategory(sourceClave)})`}
                opacity={isCompleted ? 0.8 : 0.4}
              />
            )
          }))}

          {/* Nodos */}
          {rawData.map(node => {
            const coord = getCoordinates(node.clave)
            const cat = getCategory(node.clave)
            const colors = categoryColors[cat]
            const style = getNodeStyle(node.clave)
            const badge = getStatusBadge(node.clave)
            const isLocked = courseStatus[node.clave] === 'locked'

            return (
              <g key={node.clave}
                transform={`translate(${coord.x}, ${coord.y})`}
                onClick={() => setSelectedNode(selectedNode === node.clave ? null : node.clave)}
                className="cursor-pointer"
                style={{ opacity: isLocked ? 0.4 : 1 }}>
                <rect width={nodeWidth} height={nodeHeight} rx="10"
                  fill={style.fill} stroke={style.stroke} strokeWidth={style.strokeWidth} />

                <text x="10" y="18" fill={colors.stroke} fontSize="10" fontWeight="900">{node.clave}</text>

                {badge && (
                  <g transform={`translate(${nodeWidth - 58}, 6)`}>
                    <rect width="50" height="13" rx="4" fill={badge.color} />
                    <text x="25" y="9.5" textAnchor="middle" fill="white" fontSize="8" fontWeight="900">{badge.label}</text>
                  </g>
                )}

                <foreignObject x="10" y="24" width={nodeWidth - 20} height={35}>
                  <div style={{fontSize: '11px', fontWeight: 'bold', lineHeight: 1.1, paddingTop: 4, color: isLocked ? '#94a3b8' : '#1e293b'}}>
                    {node.nombre}
                  </div>
                </foreignObject>

                <text x="10" y={nodeHeight - 8} fontSize="10" fontWeight="900" fill="#94a3b8">
                  {node.creditos.toFixed(1)} CR
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Modal detalle */}
      {selectedNode && (() => {
        const node = rawData.find(n => n.clave === selectedNode)
        const cat = getCategory(selectedNode)
        const colors = categoryColors[cat]
        const status = courseStatus[selectedNode]
        return (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white border-t-4 rounded-2xl shadow-2xl p-4 z-50"
            style={{borderTopColor: colors.stroke}}>
            <div className="flex justify-between items-start mb-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-black text-white uppercase"
                style={{backgroundColor: colors.stroke}}>{selectedNode}</span>
              <button onClick={() => setSelectedNode(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100">✕</button>
            </div>
            <h2 className="text-base font-bold text-slate-800 mb-3">{node.nombre}</h2>
            <div className="flex gap-3 mb-3">
              <div className="px-3 py-1.5 rounded-lg text-xs font-bold"
                style={{backgroundColor: status === 'completed' ? '#f0fdf4' : status === 'available' ? colors.bg : '#f8fafc',
                        color: status === 'completed' ? '#16a34a' : status === 'available' ? colors.stroke : '#94a3b8'}}>
                {status === 'completed' ? '✓ Completado' : status === 'available' ? '► Puedes llevarlo' : '🔒 Bloqueado'}
              </div>
              <div className="px-3 py-1.5 bg-slate-50 rounded-lg text-xs font-bold text-slate-600">
                {node.creditos} créditos
              </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Requisitos</p>
            <div className="flex flex-wrap gap-2">
              {node.reqs.map(r => (
                <span key={r} className={`px-2 py-1 rounded-lg text-[11px] font-bold border-2 ${
                  completedCourses.includes(cleanReq(r))
                    ? 'border-green-200 bg-green-50 text-green-700'
                    : 'border-slate-100 bg-slate-50 text-slate-500'
                }`}>{r}</span>
              ))}
            </div>
          </div>
        )
      })()}
    </div>
  )
}