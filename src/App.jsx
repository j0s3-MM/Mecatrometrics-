import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Login from './Login'
import Register from './Register'
import Admin from './Admin'
import CourseSelector from './CourseSelector'
import Planner from './Planner'

export default function App() {
  const [session, setSession] = useState(null)
  const [student, setStudent] = useState(null)
  const [completedCourses, setCompletedCourses] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState('login')

  // Ruta admin
  if (window.location.pathname === '/admin') return <Admin />

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchStudent(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchStudent(session.user.id)
      else { setStudent(null); setCompletedCourses(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchStudent = async (userId) => {
    const { data: studentData } = await supabase
      .from('students')
      .select('*')
      .eq('id', userId)
      .single()
    setStudent(studentData)

    // Cargar cursos completados
    const { data: coursesData } = await supabase
      .from('student_courses')
      .select('course_clave')
      .eq('student_id', userId)
      .eq('status', 'completed')
    setCompletedCourses(coursesData?.map(c => c.course_clave) || [])
    setLoading(false)
  }

  const logout = async () => await supabase.auth.signOut()

  const handleCoursesDone = (claves) => setCompletedCourses(claves)

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-slate-400 font-bold text-sm uppercase tracking-widest">Cargando...</div>
    </div>
  )

  if (!session) {
    if (page === 'register') return <Register onGoLogin={() => setPage('login')} />
    return <Login onGoRegister={() => setPage('register')} />
  }

  if (!student) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="text-4xl mb-4">⏳</div>
        <h2 className="text-xl font-black text-slate-800 mb-2">Cuenta en revisión</h2>
        <p className="text-sm text-slate-500 mb-6">
          Estamos verificando tu foto del Campus Virtual.<br />
          Te notificaremos por email cuando sea aprobada.
        </p>
        <button onClick={logout} className="text-xs text-slate-400 hover:text-slate-600 font-bold uppercase">
          Cerrar sesión
        </button>
      </div>
    </div>
  )

  if (student.status === 'pending') return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="text-4xl mb-4">⏳</div>
        <h2 className="text-xl font-black text-slate-800 mb-2">Cuenta en revisión</h2>
        <p className="text-sm text-slate-500 mb-6">
          Estamos verificando tu foto del Campus Virtual.<br />
          Te notificaremos por email cuando sea aprobada.
        </p>
        <button onClick={logout} className="text-xs text-slate-400 hover:text-slate-600 font-bold uppercase">
          Cerrar sesión
        </button>
      </div>
    </div>
  )

  if (student.status === 'rejected') return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="text-4xl mb-4">❌</div>
        <h2 className="text-xl font-black text-slate-800 mb-2">Cuenta rechazada</h2>
        <p className="text-sm text-slate-500 mb-6">
          No pudimos verificar tu foto. Contáctanos por Instagram.
        </p>
        <button onClick={logout} className="text-xs text-slate-400 hover:text-slate-600 font-bold uppercase">
          Cerrar sesión
        </button>
      </div>
    </div>
  )

  // Aprobado — sin cursos aún → selector
  if (student.status === 'approved' && completedCourses?.length === 0) return (
    <CourseSelector
      studentId={student.id}
      onDone={handleCoursesDone}
    />
  )

  // Aprobado — con cursos → planificador
  if (student.status === 'approved' && completedCourses?.length > 0) return (
    <Planner
      completedCourses={completedCourses}
      studentName={student.full_name.split(' ')[0]}
      onEditCourses={() => setCompletedCourses([])}
    />
  )
}