import { Text, View} from 'react-native';
import {SafeAreaView} from "react-native-safe-area-context";
import {useEffect, useState} from "react";
import {ProductType} from "@/types/globals";
import { fetchProducts} from "@/lib/appwrite";
import {useAuthContext} from "@/lib/authContext";
import { useIsFocused } from '@react-navigation/native';
import ProductCard from '@/components/productCard';
import ProductCarousel from '@/components/productCaroussel';

const Product = () => {
    const [products, setProducts] = useState<ProductType[]>([]);
    const isFocused = useIsFocused()
    const {business } = useAuthContext()
    
    useEffect(() => {
          
            const productss =async()=> {
                const response2 = await fetchProducts(business?.$id!)
               
                
                if(!response2){
                    setProducts([])
                }else{
                    setProducts(response2 as unknown as ProductType[])
                }
            }
            
            productss() 
            
          
          
        }, []);

    return (
        <>


            <SafeAreaView className={"w-full h-full flex bg-primary-100 p-4 "}>
                <View className={"w-full h-[50px] "}>
                    <Text className={"text-3xl font-Poppins-bold text-primary-400 "}>Products</Text>
                </View>
                
                <ProductCarousel products={products} />

            </SafeAreaView>
        </>
    )
}

export default Product;
