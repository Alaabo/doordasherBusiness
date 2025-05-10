import {View, FlatList, ListRenderItem, Text, Image} from 'react-native';
import { ProductType } from "@/types/globals";
import ProductCard from './productHolder';
import {Link} from "expo-router";
import {images} from "@/constants";
import React from "react";

interface IProps {
    products: ProductType[];
}

const ProductCarousel = ({ products }: IProps) => {
    const renderItem: ListRenderItem<ProductType> = ({ item }) => (
        <ProductCard
            product={item}
        />
    );

    return (
       <>
        
           {
               products.length === 0 &&
                <View className={"w-full h-full flex justify-center items-center"}>
                  <Text className={"text-primary-300 text-3xl font-Poppins-medium "}>There is no products yet</Text>
                 <Link className={" flex items-center justify-center"} href={"/addNewProduct"}>
                        <Text className={"text-primary-400 font-Poppins-bold text-2xl my-6"}>Add New Product</Text>
	                    <Image source={images.rightArrow} resizeMode={"contain"} className={"w-[16px] h-[16px]"} />
                 </Link>
               </View>
           }
           <View className="py-2">
               <FlatList
                   data={products}
                   renderItem={renderItem}
                   keyExtractor={(item) => item.$id}
                   showsHorizontalScrollIndicator={false}
                   contentContainerStyle={{ paddingHorizontal: 2 }}
                   snapToAlignment="start"
                   decelerationRate="fast"
                   snapToInterval={176} // width of card (160) + margin (16)
               />
           </View>
       </>
    );
};

export default ProductCarousel;