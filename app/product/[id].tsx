import { fetchProductDetails, deleteProduct } from "@/lib/appwrite";
import { ProductType } from "@/types/globals";
import { useIsFocused } from "@react-navigation/native";
import { useLocalSearchParams, router } from "expo-router";
import React, { useEffect, useState } from "react";
import { 
  ActivityIndicator, 
  Alert, 
  Image, 
  Text, 
  View, 
  TouchableOpacity,
  ScrollView,
  Dimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Product = () => {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<ProductType | null>(null);
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [deleting, setDeleting] = useState<boolean>(false);
  
  const screenHeight = Dimensions.get("window").height;

  useEffect(() => {
    fetchProduct();
  }, [isFocused]);

  const fetchProduct = async () => {
    try {      
      const response = await fetchProductDetails(id as string);
      
      if (response) {
        setProduct(response);
      } else {
        setError("Product not found.");
      }
    } catch (err) {
      setError("Failed to load product details.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    Alert.alert(
      "Delete Product",
      "Are you sure you want to delete this product?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteProduct(product?.$id as string);
              Alert.alert("Success", "Product deleted successfully");
              router.back();
            } catch (err) {
              Alert.alert("Error", "Failed to delete product");
              setDeleting(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#2dc87d" size="large" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center p-6 bg-white">
        <Text className="text-lg font-poppins-medium text-primary-400">{error}</Text>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mt-4 bg-primary-200 py-3 px-6 rounded-lg"
        >
          <Text className="text-white font-poppins-medium">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
        <>
        <View className="w-full fixed top-0" style={{ height: screenHeight * 0.45 }}>
          <Image
            source={{ uri: product?.coverpic }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
    <View className="flex-1 bg-white p-4">
      <ScrollView className="flex-1">
        {/* Product Image - Takes almost half of the screen */}
        
        {/* Product Details */}
        <View className="p-6 border border-primary-300 rounded-xl">
          {/* Product Title */}
          <Text className="text-2xl font-Poppins-bold text-primary-400 mb-4">
            {product?.name}
          </Text>
          <Text className="text-2xl font-Poppins-bold text-primary-400 mb-4">
            {product?.price} DZD   {product?.$id}
          </Text>
          
          {/* Product Description */}
        </View>
          <View className="p-6 border border-primary-300 rounded-xl mt-4">
            <Text className="text-xl font-Poppins-bold text-primary-400">
                Description
            </Text>
          <Text className="text-md font-Poppins-medium text-primary-400 leading-6 mb-8">
            {product?.description}
          </Text>
          </View>
      </ScrollView>
      
      {/* Delete Button - Fixed at bottom */}
      <View className="p-6">
        <TouchableOpacity 
          onPress={handleDeleteProduct}
          disabled={deleting}
          className="w-full py-4 bg-red-500 rounded-lg items-center"
        >
          {deleting ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text className="text-white font-poppins-semibold">Delete Product</Text>
          )}
        </TouchableOpacity>
      </View>
    </View></>
  );
};

export default Product;