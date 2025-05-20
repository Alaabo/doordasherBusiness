import { images } from "@/constants";
import { useAuthContext } from "@/lib/authContext";
import { useLocationContext } from "@/lib/locationContxt";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, router } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, Dimensions, I18nManager, Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Linking from 'expo-linking'
import { login } from "@/lib/appwrite";
export default function Index() {
  const { width , height } = Dimensions.get('screen')
  const { t, i18n } = useTranslation();
  const { isLogged, authLoading, authErrors , reload , logout } = useAuthContext();
  const { locationLoading } = useLocationContext();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const isRTL = i18n.language === 'ar' || I18nManager.isRTL;
  const url = Linking.useURL()

  useEffect(() => {
    // Redirect if already logged in
  if (!locationLoading && !authLoading && isLogged) router.replace('/(root)/home')
  
}, [locationLoading , authLoading , isLogged]);


  // Show loading state
  if (authLoading || locationLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      
      const results = await login();
      
      if (results.succes) {
        router.push('/phoneNumber')
        
      } else {
        Alert.alert('Error', 'Failed to login');
        console.log(authErrors);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', `Login failed: ${errorMessage}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  

  return (
    <ImageBackground source={images.onBoarding} style={{width : width , height : height}}>
       <LinearGradient
        colors={[ "rgba(34, 150, 94, 1)","rgba(34, 150, 94, 0.7)","rgba(34, 150, 94, 0.3)","rgba(0, 0, 0, 1)"]} // Green gradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.overlay}
      />
        <SafeAreaView className="flex items-center h-full justify-evenly">
         <View className="flex justify-center items-center">
         <Image source={images.logo} className="w-24 h-24"/>
          <View className="flex-row m-4 items-center">
            <Text className="text-7xl font-Poppins-bold text-center text-primary-100">{t('app_name')}</Text>
          </View>
          <View style={{ width : width*0.8 , borderWidth : 2 , borderBottomColor : 'white' , borderStyle : 'dashed'}}/>
          <Text className="text-2xl font-Poppins-medium text-primary-100 m-4">{t('Business Portal')}</Text>
         </View>
          <TouchableOpacity 
        className="items-center bg-primary-100 rounded-lg p-4  "
        style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'center' }}
        onPress={handleLogin}
        disabled={isLoggingIn}
      >
        {isLoggingIn ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <>
            <Image source={images.google} className="w-8 h-8" />
            <Text className={`text-2xl text-primary-300 font-Poppins-medium px-2 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('loginWithGoogle')}
            </Text>
            <Image 
              source={isRTL ? images.rightArrow : images.rightArrow} 
              className="w-8 h-8"
              style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }} // Flip the arrow for RTL
            />
          </>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={()=>logout()}>
        <Text>Logout</Text>
      </TouchableOpacity>
        </SafeAreaView>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject, // Covers the entire background
  },
  content: {
    position: "absolute", // Ensures content is above the gradient
  },
});