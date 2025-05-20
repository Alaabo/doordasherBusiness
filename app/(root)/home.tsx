import {View, Text, Image ,TouchableHighlight, TouchableOpacity, FlatList} from 'react-native'
import React, {useEffect} from 'react'
import { useAuthContext } from '@/lib/authContext'
import {SafeAreaView} from "react-native-safe-area-context";
import {images} from "@/constants";
import {Link, router} from "expo-router";
import {fetchOrdersByStoreId, fetchProducts, fetchProductsById} from "@/lib/appwrite";
import {ProductType, RequestType} from "@/types/globals";
import OrderComponent from "@/components/ordersCard";
import ProductCard from "@/components/productCard";
import { useIsFocused } from '@react-navigation/native';
import RequestsCard from '@/components/requestCard';



const Home = () => {
  const {userData , business} = useAuthContext()
    const [orders , setOrders] = React.useState<RequestType[]>([])
    const [products, setProducts] = React.useState<ProductType[]>([])
    const [error, setError] = React.useState<string>('')
    const balance = "0,00"
    const isFocused = useIsFocused()
    useEffect(() => {
        const orders =async()=> {
            const response1 = await fetchOrdersByStoreId(business?.$id!)            
            if(!response1){
                setOrders([])
            }else{
                //@ts-ignore
                setOrders(response1.documents as unknown as RequestType[])
            }
        }
        const productss =async()=> {
            const response2 = await fetchProducts(business?.$id!)
            
            if(!response2){
                setProducts([])
            }else{
                setProducts(response2 as unknown as ProductType[])
            }
        }
        
          orders() 
          productss()
        
      
      
    }, [isFocused]);

    const renderRequestItem = ({ item }: { item: RequestType }) => {
        return(
            <RequestsCard request={item} onPress={()=>{router.push(`/request/${item.$id}`)}}/>
        )
    }
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
              {orders.length>0 ? (
                  <>

                  <FlatList
                            data={orders}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={renderRequestItem}
                            initialNumToRender={10}
                            maxToRenderPerBatch={10}
                            windowSize={5}
                            horizontal
                            getItemLayout={(data, index) => ({
                              length: 220, // Approximate height of each item
                              offset: 220 * index,
                              index,
                            })}
                          />
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
          </View>

      </SafeAreaView>
  )
}

export default Home