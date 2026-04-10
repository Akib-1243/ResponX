import { createContext, useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';


axios.defaults.withCredentials = true;

export const AppContent = createContext()

export const AppContextProvider =(props) => {


    axios.defaults.withCredentials = true;
    const backendUrl = import.meta.env.VITE_BACKEND_URL || ''
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [userData, setUserData] = useState(false)
    const [authLoading, setAuthLoading] = useState(true)

    const getAuthState = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/auth/is-auth`)
            if (data.success) {
                setIsLoggedIn(true);
                await getUserData();
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setAuthLoading(false)
        }
    }

    const getUserData = async() => {
        try {
            const {data} = await axios.get(`${backendUrl}/api/user/data`);
            if (data.success) {
                setUserData(data.user);
                return data.user;
            }
            toast.error(data.message);
            return null;
        } catch (error) {
            toast.error(error.message);
            return null;
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
        authLoading,
        getUserData
    }

    return(
        <AppContent.Provider value={value}>
            {props.children}
        </AppContent.Provider>

    )
}