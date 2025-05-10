import { View, Text, ActivityIndicator } from 'react-native'
import React from 'react'
import { Redirect, Tabs } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Image, ImageSourcePropType } from "react-native";
import { images } from '@/constants'
import { useAuthContext } from '@/lib/authContext'
import i18next, { t } from 'i18next'
const rootLayout = () => {
    // const { loading , isLogged} =
    const { isLogged , authLoading} = useAuthContext()

    const TabIcon = ({
                         focused,
                         icon,
                         title,
                     }: {
        focused: boolean;
        icon: ImageSourcePropType;
        title: string;
    }) => (
        <View className="flex-1 mt-3 flex flex-col items-center">
            <Image
                source={icon}
                tintColor={focused ? "#0061FF" : "#666876"}
                resizeMode="contain"
                className="size-6"
            />
            <Text
                className={`${
                    focused
                        ? "text-primary-300 font-rubik-medium"
                        : "text-black-200 font-rubik"
                } text-xs w-full text-center mt-1`}
            >
                {t(title)}
            </Text>
        </View>
    );
    if(authLoading){
        return (
            <SafeAreaView className='flex-1 h-screen bg-primary-200 items-center justify-center'>
                <ActivityIndicator  size={100} className='text-primary-200'/>
                <Text className='font-Poppins-Thin text-5xl'>Loading</Text>
            </SafeAreaView>
        )
    }

    if(!isLogged) return <Redirect href='/'/>
    return (
        <Tabs
            screenOptions={{
                tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: "white",
                    position: "absolute",
                    borderTopColor: "#0061FF1A",
                    borderTopWidth: 1,
                    minHeight: 70,
                },
            }}
        >
            <Tabs.Screen
                name="profile"
                options={{

                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={images.user} title={t("Profile")} />
                    ),
                }}
            />
            <Tabs.Screen
                name="home"
                options={{

                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={images.home}title={t("Home")} />
                    ),
                }}
            />
            <Tabs.Screen
                name="products"
                options={{

                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon={images.add} title={t('Products')} />
                    ),
                }}
            />
        </Tabs>
    )
}

export default rootLayout


// import { Stack } from "expo-router";
// import { StatusBar } from "react-native";
// import { I18nextProvider } from "react-i18next";
// import i18n from "@/utils/i18n";
// import { AuthProvider } from "@/lib/authContext";
// import { LocationProvider } from "@/lib/locationContxt";
// export default function RootLayout() {
//
//     return (
//         <>
//             <LocationProvider>
//                 <AuthProvider>
//                     <I18nextProvider i18n={i18n}>
//                         <Stack>
//                             <Stack.Screen name="home" options={{headerShown : false}}/>
//                         </Stack>
//                         <StatusBar hidden = {true} />
//                     </I18nextProvider>
//                 </AuthProvider>
//             </LocationProvider>
//         </>
//     );
// }
