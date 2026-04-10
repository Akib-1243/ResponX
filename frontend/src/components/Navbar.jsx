import React from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets.js'
import { AppContent } from '../context/AppContext.jsx'
import { useContext } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'




const Navbar = () => {
    const navigate = useNavigate()
    const {userData,backendUrl,setUserData,setIsLoggedIn} = useContext(AppContent)
    const sendVerificationOtp = async() => {
        try {
            axios.defaults.withCredentials = true;
            const {data} = await axios.post(`${backendUrl}/api/auth/send-verify-otp`)

            if(data.success){
              navigate('/email-verify')
              toast.success(data.message) 
                
            }else{
              toast.error(data.message)
            }
        }catch (error) {
            toast.error(error.message)
        }
      }

    const logout= async() => {
        try {
            axios.defaults.withCredentials = true
            const {data}=await axios.post(`${backendUrl}/api/auth/logout`)
            data.success &&  setIsLoggedIn(false);
            data.success && setUserData(false);
            navigate('/')
        } catch (error) {
             toast.error(error.message)
        }
    }


  return (
    <div className='top-bar'>
      <div className='top-bar-brand'>
        <div className='brand-mark' />
        <div>
          <div className='brand-name'>ResponX</div>
          <div className='brand-tag'>Emergency response dashboard</div>
        </div>
      </div>

      {userData ? (
        <div className='top-bar-user'>
          <button className='user-badge' type='button'>
            {userData.name[0].toUpperCase()}
          </button>
          <div className='user-menu'>
            <ul>
              {!userData.isAccountVerified && (
                <li onClick={sendVerificationOtp}>Verify Email</li>
              )}
              <li onClick={logout}>Logout</li>
            </ul>
          </div>
        </div>
      ) : (
        <button
          onClick={() => navigate('/login')}
          className='top-bar-login'
        >
          Login
          <img src={assets.arrow_icon} alt='' className='login-arrow' />
        </button>
      )}
    </div>
  )
}


export default Navbar
