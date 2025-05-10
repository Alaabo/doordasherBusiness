import { View, Text, useAnimatedValue, ActivityIndicator, Image, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuthContext } from '@/lib/authContext'
import { RequestType } from '@/types/globals'
import { fetchOrdersByStoreId } from '@/lib/appwrite'
import { images } from '@/constants'
import RequestsCard from '@/components/requestCard'
import { router } from 'expo-router'

const Orders = () => {
    const {business} = useAuthContext()
    const [orders, setOrders] = useState<RequestType[] | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string>("")
    useEffect(() => {
      const operation = async ()=>{
            try {
                const response = await fetchOrdersByStoreId(business?.$id!)
                if(response){
                    //@ts-ignore
                    setOrders(response.documents)
                }
            } catch (error) {
                setError('Unexpected Error just happened please reload the application')
            }finally{
                setLoading(false)
            }
      }
    
      operation()
    }, [])
    const renderRequestItem = ({ item }: { item: RequestType }) => {
        return(
            <RequestsCard request={item} onPress={()=>{router.push(`/request/${item.$id}`)}}/>
        )
    }
  return (
    <>
        <SafeAreaView className='flex p-4 h-full'>
            <Text className='text-3xl text-primary-400 font-Poppins-bold'>Orders</Text>
            {loading && <ActivityIndicator color={'green'} size={'large'} />}
            {error && <Text>{error}</Text>}
            {orders?.length ==0 ? <View className='flex justify-center items-center h-full'>
                <Text className='text-xl font-Poppins-medium text-primary-300'>orders are on the way</Text>
                <View className='w-[10px] h-[100px]'>
                <Image source={images.noResults}  resizeMode='cover'/>
                </View>
            </View> : <View>
            <FlatList
          data={orders}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderRequestItem}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          getItemLayout={(data, index) => ({
            length: 220, // Approximate height of each item
            offset: 220 * index,
            index,
          })}
        />
                </View>}
        </SafeAreaView>
    </>
  )
}

export default Orders