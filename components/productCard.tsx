import {FlatList, Image, Text, TouchableOpacity, View} from 'react-native';
import {ProductType} from "@/types/globals";
import {Link, router} from "expo-router";
import {images} from "@/constants";
import React from "react";

interface ProductCardProps {
    products: ProductType[]
}

const ProductCard = ({ products }: ProductCardProps) => {
 
    const renderRequestItem = ({ item }: { item: ProductType }) => (
        <TouchableOpacity onPress={()=>router.push(`/product/${item.$id}`)} className='mx-2'>
            <View className={"w-[300px] h-[300px] bg-primary-100 rounded-3xl flex-col items-center justify-center"}>
            <Image source={{uri : item.coverpic}} className="w-[300px] h-[200px] mb-2" resizeMode={"contain"}/>
            <View className={"flex-col justify-center items-center w-full h-[30px] bg-primary-100 rounded-3xl mb-4"}>
                <Text className={" font-Poppins-medium text-primary-300 "}>
                    {item.name}
                </Text>
                <Text className={" font-Poppins-medium text-primary-300 text-xl "}>
                    {item.price} DZD
                </Text>
            </View>
        </View>
        </TouchableOpacity>
    );
    return (
        <>
            <FlatList
                data={products}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderRequestItem}
                contentContainerStyle={{paddingBottom: 16,}}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
                getItemLayout={(data, index) => ({
                    length: 300, // Approximate height of each item
                    offset: 220 * index,
                    index,
                })}
                ListEmptyComponent={
                <View className={"flex-col justify-center items-center w-full h-[300px] bg-primary-100 rounded-3xl mb-4"}>
                    <Text className={" font-Poppins-medium text-primary-300 "}>No Products</Text>
                    <TouchableOpacity onPress={() => router.push("/addNewProduct")}
                                      className={"w-[250px] h-fullbg-primary-100 rounded-3xl flex items-center justify-center"}>
                        <Image source={images.add} className="w-[32px] h-[32px] mb-2" resizeMode={"contain"}/>
                        <Text className={" font-Poppins-medium text-primary-300 "}>
                            Add New Product
                        </Text>
                    </TouchableOpacity>
                </View>
                }
                ListFooterComponent={
                                 <Link className={"text-xl font-Poppins-medium flex items-center justify-center"} href="/products">
                                    <Text className={"text-xl font-Poppins-medium"}>See All Products</Text>
                                    <Image source={images.rightArrow} resizeMode={"contain"} className={"w-[12px] h-[12px]"} />
                                  </Link>
                }
                horizontal={true}
            />

        </>
    )
}

export default ProductCard;
