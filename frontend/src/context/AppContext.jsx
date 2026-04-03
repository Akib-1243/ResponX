import { createContext, useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';


axios.defaults.withCredentials = true;

export const AppContent = createContext()

export const AppContextProvider =(props) => {


    axios.defaults.withCredentials = true;
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const[userData,setUserData] = useState(false)

    const getAuthState= async() => {
        try {
            const {data} = await axios.get(`${backendUrl}/api/auth/is-auth`)
            if(data.success){
                setIsLoggedIn(true);
                getUserData();
            }
        } catch (error) {
            toast.error(error.message)   
        }
    }

    const getUserData = async() => {
        try {
            const {data} = await axios.get(`${backendUrl}/api/user/data`,)
                data.success?setUserData(data.user):toast.error(data.message)
            
            
        } catch (error) {
            toast.error(error.message)   
        }
    }

    useEffect(() => {
        getAuthState();
    }, [])


    const value = {
        backendUrl,
        isLoggedIn,
        setIsLoggedIn,
        userData,
        setUserData,
        getUserData
    }

    return(
        <AppContent.Provider value={value}>
            {props.children}
        </AppContent.Provider>

    )
}