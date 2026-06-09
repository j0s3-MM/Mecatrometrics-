import { useState } from 'react'
import { supabase } from './supabase'

export default function Login({ onGoRegister }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (error) {
      setLoading(false)
      return setMsg({ type: 'error', text: 'Correo o contraseña incorrectos' })
    }

    // La sesión se maneja en App.jsx automáticamente
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-1">Mecatrométrics</h1>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6">Iniciar sesión</p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs font-black text-slate-500 uppercase">Correo PUCP</label>
            <input name="email" type="email" required onChange={handle}
              className="w-full mt-1 px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-purple-500 outline-none"
              placeholder="a20215678@pucp.edu.pe" />
          </div>
          <div>
            <label className="text-xs font-black text-slate-500 uppercase">Contraseña</label>
            <input name="password" type="password" required onChange={handle}
              className="w-full mt-1 px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-purple-500 outline-none"
              placeholder="Tu contraseña" />
          </div>

          {msg && (
            <div className="p-3 rounded-lg text-sm font-medium bg-red-50 text-red-700">
              {msg.text}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-lg transition-colors disabled:opacity-50">
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-4">
          ¿No tienes cuenta?{' '}
          <button onClick={onGoRegister} className="text-purple-600 font-bold hover:underline">Regístrate</button>
        </p>
      </div>
    </div>
  )
}