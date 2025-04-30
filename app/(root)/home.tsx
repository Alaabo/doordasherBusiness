import {View, Text, Image ,TouchableHighlight, TouchableOpacity} from 'react-native'
import React, {useEffect} from 'react'
import { useAuthContext } from '@/lib/authContext'
import {SafeAreaView} from "react-native-safe-area-context";
import {images} from "@/constants";
import {Link, router} from "expo-router";
import {fetchOrdersByStoreId, fetchProductsById} from "@/lib/appwrite";
import {Property} from "csstype";
import {ProductType, RequestType} from "@/types/globals";
import OrderComponent from "@/components/ordersCard";
import ProductCard from "@/components/productCard";



const Home = () => {
  const {userData , logout} = useAuthContext()
    const [orders , setOrders] = React.useState<RequestType[]>([])
    const [products, setProducts] = React.useState<ProductType[]>([])
    const [error, setError] = React.useState<string>('')
    const balance = "0,00"
    useEffect(() => {
        const orders =async()=> await fetchOrdersByStoreId(userData?.$id!)
        const productResults = async()=>await fetchProductsById(userData?.$id!)
        if(!orders){
            setOrders([])
        }else{
            setError("Unexpected error")
        }
        if(!productResults){
            setProducts([])
        }else{
            setError("Unexpected error")
        }
    }, []);
  return (
      <SafeAreaView className={"p-4 h-screen"}>
          <View className={"mb-2"}>
              <Text className={"text-2xl font-Poppins-medium text-primary-400" }>
                  Welcome Back  {userData?.name}
              </Text>
              <Text className={"text-2xl font-Poppins-medium text-primary-300"}>
                  available balance : {balance} DZD
              </Text>
          </View>
          <View>
              <Text className={"text-xl font-Poppins-medium text-primary-400"}>orders</Text>
              {orders.length>1 ? (
                  <>

                  <OrderComponent orders={orders} />
                  </>
              ):(
                  <>
                  <View className={"flex-col justify-center items-center w-full h-[300px] bg-primary-100 rounded-3xl mb-4"}>
                      <Image source={images.noResults} resizeMode={"contain"} className={"w-[200px] h-[200px]"} />
                      <Text className={"text-xl font-Poppins-medium text-primary-300 "}>There is no Orders yet</Text>
                  </View>
                  </>

              )}
              <View>
                  <Text className={"text-xl font-Poppins-light text-center mb-2 text-primary-300 "}>-----------------------</Text>
              </View>
          </View>
          <View className={" flex justify-center items-center"}>
                <ProductCard products={products}/>

              <Link className={"text-xl font-Poppins-medium flex items-center justify-center "} href="/product">See All Products
                <Image source={images.rightArrow} resizeMode={"contain"} className={"w-[16px] h-[16px]"} />
              </Link>
          </View>

      </SafeAreaView>
  )
}

export default Home