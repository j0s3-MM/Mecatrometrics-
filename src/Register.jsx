import { useState } from 'react'
import { supabase } from './supabase'

export default function Register({ onGoLogin }) {
  const [form, setForm] = useState({ full_name: '', student_code: '', email: '', password: '' })
  const [photo, setPhoto] = useState(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async e => {
    e.preventDefault()
    if (!photo) return setMsg({ type: 'error', text: 'Debes subir una foto de tu Campus Virtual' })
    setLoading(true)
    setMsg(null)

    // 1. Crear cuenta
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })
    if (authError) { setLoading(false); return setMsg({ type: 'error', text: authError.message }) }

    const userId = authData.user.id

    // 2. Subir foto
    const ext = photo.name.split('.').pop()
    const { error: uploadError } = await supabase.storage
      .from('campus-photos')
      .upload(`${userId}/campus.${ext}`, photo)
    if (uploadError) { setLoading(false); return setMsg({ type: 'error', text: 'Error subiendo foto' }) }

    const photoUrl = `${userId}/campus.${ext}`

    // 3. Guardar datos del estudiante
    const { error: dbError } = await supabase.from('students').insert({
      id: userId,
      full_name: form.full_name,
      student_code: form.student_code,
      email: form.email,
      verification_photo_url: photoUrl,
      status: 'pending'
    })
    if (dbError) { setLoading(false); return setMsg({ type: 'error', text: dbError.message }) }

    // 4. Notificar por Telegram
    await fetch(`https://api.telegram.org/bot8672212091:AAHgBsflwDL-nKcuWy0CicilANYBAqK3Jds/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: '5716182091',
        text: `🆕 Nuevo alumno registrado\n👤 ${form.full_name}\n🎓 Código: ${form.student_code}\n📧 ${form.email}`
      })
    })

    setLoading(false)
    setMsg({ type: 'ok', text: '✅ Registro exitoso. Recibirás un email cuando tu cuenta sea aprobada.' })
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-1">Mecatrométrics</h1>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6">Crear cuenta</p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs font-black text-slate-500 uppercase">Nombre completo</label>
            <input name="full_name" required onChange={handle}
              className="w-full mt-1 px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-purple-500 outline-none"
              placeholder="José García Torres" />
          </div>
          <div>
            <label className="text-xs font-black text-slate-500 uppercase">Código de alumno</label>
            <input name="student_code" required onChange={handle}
              className="w-full mt-1 px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-purple-500 outline-none"
              placeholder="20215678" />
          </div>
          <div>
            <label className="text-xs font-black text-slate-500 uppercase">Correo PUCP</label>
            <input name="email" type="email" required onChange={handle}
              className="w-full mt-1 px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-purple-500 outline-none"
              placeholder="a20215678@pucp.edu.pe" />
          </div>
          <div>
            <label className="text-xs font-black text-slate-500 uppercase">Contraseña</label>
            <input name="password" type="password" required minLength={6} onChange={handle}
              className="w-full mt-1 px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-purple-500 outline-none"
              placeholder="Mínimo 6 caracteres" />
          </div>
          <div>
            <label className="text-xs font-black text-slate-500 uppercase">Foto de tu Campus Virtual</label>
            <p className="text-[10px] text-slate-400 mb-1">Captura donde se vea tu nombre y código de alumno</p>
            <input type="file" accept="image/*" required onChange={e => setPhoto(e.target.files[0])}
              className="w-full mt-1 text-sm text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-purple-50 file:text-purple-700 file:font-bold" />
          </div>

          {msg && (
            <div className={`p-3 rounded-lg text-sm font-medium ${msg.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {msg.text}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-lg transition-colors disabled:opacity-50">
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-4">
          ¿Ya tienes cuenta?{' '}
          <button onClick={onGoLogin} className="text-purple-600 font-bold hover:underline">Inicia sesión</button>
        </p>
      </div>
    </div>
  )
}