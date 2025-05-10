import { useAuthContext } from '@/lib/authContext';
import { router } from 'expo-router';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Profile = () => {
    const { userData , logout } = useAuthContext()
    return (
        <>
           <SafeAreaView className='p-4 flex h-full '>
            <Text className='text-3xl font-Poppins-bold text-primary-400'>Profile</Text>
            <View className='flex justify-center items-center h-[200px]  m-4'>
                <Image source={{uri : userData?.avatar}} resizeMode='cover' className='w-[200px] h-[200px] rounded-full border border-primary-300 border-dashed border-spacing-3' />
            </View>
            <View className='w-full flex justify-center items-center mb-12'>
                <Text className='text-2xl font-Poppins-medium text-primary-400'>{userData?.name}</Text>
                <Text className='text-xl font-Poppins-light text-primary-400'>{userData?.email}</Text>
            </View>
            <View>
                <TouchableOpacity className='border border-primary-300 p-4 rounded-xl my-2' onPress={()=>{ router.push('/(root)/products')}}>
                    <Text className='text-xl font-Poppins-medium text-primary-300'>Products</Text>
                </TouchableOpacity>
            </View>
            <View>
                <TouchableOpacity className='border border-primary-300 p-4 rounded-xl my-2' onPress={()=>{router.push('/orders')}}>
                    <Text className='text-xl font-Poppins-medium text-primary-300'>Orders</Text>
                </TouchableOpacity>
            </View>
            <View>
                <TouchableOpacity className='border border-primary-300 p-4 rounded-xl my-2' onPress={()=>{logout() ; router.replace('/')}}>
                    <Text className='text-xl font-Poppins-medium text-red-500'>Logout</Text>
                </TouchableOpacity>
            </View>
           </SafeAreaView>
        </>
    )
}

export default Profile;
