import { useState, useEffect } from 'react'
import { supabase } from './supabase'

const ADMIN_PASSWORD = 'mecatrometrics2024'

export default function Admin() {
  const [auth, setAuth] = useState(false)
  const [pwd, setPwd] = useState('')
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [photoUrls, setPhotoUrls] = useState({})

  const login = () => {
    if (pwd === ADMIN_PASSWORD) setAuth(true)
    else alert('Contraseña incorrecta')
  }

  useEffect(() => {
    if (auth) fetchPending()
  }, [auth])

  const fetchPending = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('students')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    setStudents(data || [])

    // Obtener URLs firmadas de las fotos
    const urls = {}
    for (const s of data || []) {
      const { data: urlData } = await supabase.storage
        .from('campus-photos')
        .createSignedUrl(s.verification_photo_url, 3600)
      if (urlData) urls[s.id] = urlData.signedUrl
    }
    setPhotoUrls(urls)
    setLoading(false)
  }

  const updateStatus = async (id, status) => {
    await supabase
      .from('students')
      .update({ 
        status, 
        approved_at: status === 'approved' ? new Date().toISOString() : null 
      })
      .eq('id', id)
    setStudents(prev => prev.filter(s => s.id !== id))
  }

  if (!auth) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-800 rounded-2xl p-8">
        <h1 className="text-xl font-black text-white mb-1">Panel Admin</h1>
        <p className="text-xs text-slate-400 mb-6 uppercase tracking-widest">Mecatrométrics</p>
        <input
          type="password"
          placeholder="Contraseña"
          value={pwd}
          onChange={e => setPwd(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
          className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg text-sm mb-3 outline-none border-2 border-slate-600 focus:border-purple-500"
        />
        <button onClick={login}
          className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-lg transition-colors">
          Entrar
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-black text-white">Panel Admin</h1>
            <p className="text-xs text-slate-400">{students.length} pendientes</p>
          </div>
          <button onClick={fetchPending}
            className="px-3 py-1.5 bg-slate-700 text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-600">
            🔄 Actualizar
          </button>
        </div>

        {loading && (
          <div className="text-center text-slate-400 text-sm py-10">Cargando...</div>
        )}

        {!loading && students.length === 0 && (
          <div className="text-center text-slate-400 text-sm py-10">
            ✅ No hay alumnos pendientes
          </div>
        )}

        <div className="space-y-4">
          {students.map(s => (
            <div key={s.id} className="bg-slate-800 rounded-2xl p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-white font-bold">{s.full_name}</p>
                  <p className="text-slate-400 text-xs">{s.email}</p>
                  <p className="text-slate-400 text-xs">Código: {s.student_code}</p>
                  <p className="text-slate-500 text-[10px] mt-1">
                    {new Date(s.created_at).toLocaleDateString('es-PE', { 
                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>

              {photoUrls[s.id] && (
                <img
                  src={photoUrls[s.id]}
                  alt="Campus Virtual"
                  className="w-full rounded-xl mb-3 max-h-64 object-contain bg-slate-700"
                />
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => updateStatus(s.id, 'approved')}
                  className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white font-black text-sm rounded-xl transition-colors">
                  ✅ Aprobar
                </button>
                <button
                  onClick={() => updateStatus(s.id, 'rejected')}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-xl transition-colors">
                  ❌ Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}