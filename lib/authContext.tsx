import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Alert, AppState, AppStateStatus } from "react-native";
import { t } from "i18next";
import { router } from "expo-router";
import { account, ChekAuthState, logoutCurrentUser, readBusiness } from "./appwrite";
import { Businesses } from "@/types/globals";
interface userProps {
    $id: string;
    name: string;
    email: string;
    avatar: string;
    role: 'client' | 'driver';
    phone: string;
    new: boolean;
}
interface AuthContextProps {
    isLogged : boolean ,
    userData : userProps | null,
    business : Businesses | null ,
    authLoading : boolean , 
    authErrors : string | null ,
    reload : () => Promise<void>,
    logout: () => Promise<void>
}
interface AuthProviderProps {
    children: ReactNode;
}

const AuthContext = createContext<AuthContextProps | null>(null)

export const AuthProvider = ({ children }: AuthProviderProps ) => {
    const [isLogged, setisLogged] = useState<boolean>(false)
    const [userData, setUserData] = useState<userProps | null>(null)
    const [authLoading, setAuthLoading] = useState<boolean>(true)
    const [authErrors, setAuthErrors] = useState<string | null>(null)
    const [business, setBusiness] = useState<Businesses | null>(null)
  
    
    
    const reload = async () =>{
        try {
            setAuthLoading(true);
            setAuthErrors(null);
            const checkForAuth = await ChekAuthState();
            
            
            if(!checkForAuth){
                setUserData(null),
                setAuthErrors('No User Logged In')
                
                setisLogged(false)
                return
            }
            const checkBusiness = await readBusiness(checkForAuth?.$id!)

            if(!checkBusiness){
                setBusiness(null)
                setAuthErrors('No store Logged In')
                
                setisLogged(false)
                return
            }

            setBusiness(checkBusiness)
            setUserData(checkForAuth)
            if(checkForAuth.new){
                router.push('/phoneNumber')
            }
            setAuthErrors(null)
            
            setisLogged(true)
        } catch (error) {
            console.log(error)
            setUserData(null),
            setAuthErrors('Error while trying to reload auth state')
            
            setisLogged(false)
            return
        } finally {
            setAuthLoading(false)
        }
    }
    const logout = async () =>{
        try {
            setAuthLoading(true);
            await logoutCurrentUser()
            setUserData(null);
            setisLogged(false);
            
            router.replace('/')
        } catch (error) {
            setAuthErrors('error while trying loggin out')
            
            setUserData(null)
            Alert.alert(
                t('error'),
                t('LogoutFailed'),
                [{ text: t('ok') }]
            )
        } finally {
            setAuthLoading(false)
        }
    }
    useEffect(() => {
        reload()
        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            // When app comes back to active state, check auth again
            if (nextAppState === 'active') {
                // reload();
            }
        });
        return () => {
            subscription.remove();
        };
    }, [])
    
    

    return (
        <AuthContext.Provider
            value={
                {
                    business ,
                    isLogged ,
                    userData ,
                    authLoading ,
                    authErrors ,
                    reload ,
                    logout


                }
            }
        >
            {children}
        </AuthContext.Provider>
    )
}


export const useAuthContext = (): AuthContextProps => {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error("Location Provider must be used within a GlobalProvider");

    return context;
};