import { View, Text, Image, TouchableOpacity } from 'react-native';
import { ProductType } from '@/types/globals';
import { router } from 'expo-router';

interface ProductCardProps {
    product: ProductType;
    onPress?: (product: ProductType) => void;
}

const ProductCard = ({ product, onPress }: ProductCardProps) => {
    return (
        <TouchableOpacity
            className="  bg-white rounded-lg shadow-sm m-2"
            onPress={() => router.push(`/product/${product.$id}`)}
        >
            <Image
                source={{ uri: product.coverpic }}
                className="w-full h-[150px] rounded-t-lg"
                resizeMode="cover"
            />
            <View className="p-2">
                <Text className="font-semibold text-base" numberOfLines={1}>
                    {product.name}
                </Text>
                <Text className="text-gray-600 text-sm" numberOfLines={2}>
                    {product.description}
                </Text>
                <Text className="text-primary font-bold mt-1">
                    ${product.price.toFixed(2)}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

export default ProductCard;