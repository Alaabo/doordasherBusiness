import {View, Text, Image ,TouchableHighlight, TouchableOpacity} from 'react-native'
import React, {useEffect} from 'react'
import { useAuthContext } from '@/lib/authContext'
import {SafeAreaView} from "react-native-safe-area-context";
import {images} from "@/constants";
import {Link, router} from "expo-router";
import {fetchOrdersByStoreId} from "@/lib/appwrite";
import {Property} from "csstype";
import {RequestType} from "@/types/globals";



const Home = () => {
  const {userData , logout} = useAuthContext()
    const [orders , setOrders] = React.useState<RequestType[]>([])
    const [error, setError] = React.useState<string>('')
    const balance = "0,00"
    useEffect(() => {
        const orders =async()=> await fetchOrdersByStoreId(userData?.$id!)
        if(!orders){
            setOrders([])
        }else{
            setError("there is no orders")
        }
    }, []);
  return (
      <SafeAreaView className={"p-4"}>
          <View className={"mb-2"}>
              <Text className={"text-3xl font-Poppins-medium" }>
                  Welcome Back  {userData?.name}
              </Text>
              <Text className={"text-2xl font-Poppins-medium"}>
                  available balance : {balance} DZD
              </Text>
          </View>
          <View>
              <Text className={"text-xl font-Poppins-medium"}>orders</Text>
              {orders.length>1 ? (
                  <>

                  <Text className={"text-xl font-Poppins-medium"}>there is orders</Text></>
              ):(
                  <>
                  <View className={"flex justify-center items-center w-full h-[300px]"}>
                      <Text className={"text-xl font-Poppins-medium"}>There is no Orders yet</Text>
                  </View>
                  </>

              )}
          </View>
          <View className={"mb-2 flex justify-center items-center"}>
              <TouchableOpacity onPress={()=> router.push("/addProduct")} className={"w-[150px] h-[80px] bg-primary-100 rounded-3xl flex items-center justify-center"}>
                        <Image source={images.add} className="w-[32px] h-[32px]" resizeMode={"contain"} />
                          <Text>
                              Add New Product
                          </Text>
              </TouchableOpacity>

              <Link className={"text-xl font-Poppins-medium flex items-center justify-center mt-4"} href="/product">See All Products
                <Image source={images.rightArrow} resizeMode={"contain"} className={"w-[16px] h-[16px]"} />
              </Link>
          </View>
      <TouchableHighlight onPress={logout}><Text>logout</Text></TouchableHighlight>
      <Text>{userData?.$id}</Text>
      </SafeAreaView>
  )
}

export default Home