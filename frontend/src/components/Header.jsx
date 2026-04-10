import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets.js'
import { AppContent } from '../context/AppContext.jsx'

const Header = () => {
  const navigate = useNavigate()
  const { isLoggedIn, userData } = useContext(AppContent)

  const handleGetStarted = () => {
    if (isLoggedIn || userData) {
      navigate('/dashboard')
    } else {
      navigate('/login')
    }
  }

  return (
    <div className='relative w-full overflow-hidden'>
      <div className='absolute inset-0 bg-slate-950/65' />
      <div className='relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-24 text-white'>
        <div className='grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-center'>
          <div>
            <span className='inline-flex rounded-full bg-blue-500/20 px-4 py-2 text-sm font-semibold text-blue-100 shadow-sm'>New feature · response dashboard</span>
            <h1 className='mt-8 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl'>ResponX helps teams act faster with real-time aid coordination.</h1>
            <p className='mt-6 max-w-xl text-base text-slate-200 sm:text-lg'>Login, submit requests, manage volunteer tasks, and track shelters from one unified dashboard.</p>
            <div className='mt-10 flex flex-col gap-4 sm:flex-row sm:items-center'>
              <button onClick={handleGetStarted} className='inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-blue-500/15 transition duration-200 hover:scale-[1.01]'>
                Get Started
              </button>
              <button onClick={() => navigate('/login')} className='inline-flex items-center justify-center rounded-full border border-slate-200/20 bg-white/10 px-8 py-3 text-base font-semibold text-white transition duration-200 hover:bg-white/15'>
                Login to continue
              </button>
            </div>
          </div>

          <div className='relative mx-auto w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl'>
            <img src={assets.header_img} alt='ResponX hero' className='h-full w-full rounded-[1.5rem] object-cover shadow-xl' />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header
