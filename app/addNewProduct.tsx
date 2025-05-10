import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import React, { useState } from "react";
import { ProductType } from "@/types/globals";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { createProduct, uploadImage } from "@/lib/appwrite";
import { useAuthContext } from '@/lib/authContext';

interface FormValues {
    name: string;
    description: string;
    price: string;
    storeId: string;
}

interface FormErrors {
    name: string;
    description: string;
    price: string;
}

interface FormTouched {
    name: boolean;
    description: boolean;
    price: boolean;
}

interface ImageAsset {
    uri: string;
    width?: number;
    height?: number;
    fileSize?: number;
}

const AddNewProduct = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedImage, setSelectedImage] = useState<ImageAsset | null>(null);
    const {business} = useAuthContext()

    // Form state
    const [formValues, setFormValues] = useState<FormValues>({
        name: '',
        description: '',
        price: '',
        storeId: '',
    });

    // Form errors state
    const [errors, setErrors] = useState<FormErrors>({
        name: '',
        description: '',
        price: '',
    });

    // Form touched state
    const [touched, setTouched] = useState<FormTouched>({
        name: false,
        description: false,
        price: false,
    });

    // Handle input changes
    const handleChange = (field: keyof FormValues) => (value: string) => {
        setFormValues({
            ...formValues,
            [field]: value
        });

        // Validate on change
        validateField(field, value);
    };

    // Handle input blur (mark as touched)
    const handleBlur = (field: keyof FormTouched) => () => {
        setTouched({
            ...touched,
            [field]: true
        });

        // Validate on blur
        validateField(field as keyof FormValues, formValues[field as keyof FormValues]);
    };

    // Validate a single field
    const validateField = (field: keyof FormValues, value: string) => {
        let newErrors = { ...errors };

        switch (field) {
            case 'name':
                if (!value || value.trim() === '') {
                    newErrors.name = 'Product name is required';
                } else if (value.length < 3) {
                    newErrors.name = 'Product name must be at least 3 characters';
                } else {
                    newErrors.name = '';
                }
                break;

            case 'description':
                if (!value || value.trim() === '') {
                    newErrors.description = 'Description is required';
                } else if (value.length < 10) {
                    newErrors.description = 'Description must be at least 10 characters';
                } else {
                    newErrors.description = '';
                }
                break;

            case 'price':
                if (!value || value.trim() === '') {
                    newErrors.price = 'Price is required';
                } else if (isNaN(Number(value)) || Number(value) <= 0) {
                    newErrors.price = 'Price must be a positive number';
                } else {
                    newErrors.price = '';
                }
                break;

            default:
                break;
        }

        setErrors(newErrors);
    };

    // Validate all fields
    const validateForm = () => {
        // Mark all fields as touched
        setTouched({
            name: true,
            description: true,
            price: true,
        });

        // Validate all fields
        validateField('name', formValues.name);
        validateField('description', formValues.description);
        validateField('price', formValues.price);

        // Check if any errors exist
        return !errors.name && !errors.description && !errors.price &&
            formValues.name.trim() !== '' &&
            formValues.description.trim() !== '' &&
            formValues.price.trim() !== '';
    };

    // Function to handle image picking
    const handleImagePick = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permissionResult.granted) {
                Alert.alert('Permission Denied', 'Permission to access gallery was denied');
                return null;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0] as ImageAsset;
                setSelectedImage(asset);
                return asset;
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Error picking image');
        }
        return null;
    };

    // Function to upload image to Appwrite
    const uploadImageToAppwrite = async (imageAsset: ImageAsset): Promise<string> => {
        try {
            const imageData = {
                uri: imageAsset.uri,
                name: imageAsset.uri.split('/').pop() || 'image.jpg',
                type: `image/${imageAsset.uri.split('.').pop()}`,
                size: imageAsset.fileSize || 0,
            };
            const response = await uploadImage(imageData);
            if (response) {
                // console.log(response);
                //@ts-ignore
                return response.$id 
            }
            return '';
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    };

    // Function to create product in database
    const saveProduct = async (productData: Omit<ProductType, '$id'>): Promise<void> => {
        try {
             const  response = await  createProduct(productData)
             console.log(response)
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    };

    const handleSubmit = async () => {
        try {
            // First validate the form
            const isValid = validateForm();

            if (!isValid) {
                Alert.alert('Validation Error', 'Please fix the errors in the form');
                return;
            }

            if (!selectedImage) {
                Alert.alert('Image Required', 'Please select an image');
                return;
            }

            setLoading(true);

            // Upload image and get URL
            const imageUrl = await uploadImageToAppwrite(selectedImage);

            // Prepare product data
            const productData: Omit<ProductType, '$id'> = {
                name: formValues.name,
                description: formValues.description,
                price: Number(formValues.price),
                coverpic: `https://fra.cloud.appwrite.io/v1/storage/buckets/pictures/files/${imageUrl}/view?project=doordasher&mode=admin`,
                storeID: business?.$id,
            };

            // Create product
            await saveProduct(productData);

            // console.log(productData);
            
            // Reset form and image
            setSelectedImage(null);
            setFormValues({
                name: '',
                description: '',
                price: '',
                storeId: '',
            });
            setTouched({
                name: false,
                description: false,
                price: false,
            });

            Alert.alert('Success', 'Product created successfully!');

        } catch (error) {
            console.error('Error submitting fstoreIdorm:', error);
            Alert.alert('Error', 'Error creating product');
        } finally {
            setLoading(false);
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            padding: 16,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 20,
            textAlign: 'center',
        },
        form: {
            gap: 16,
        },
        imageSection: {
            alignItems: 'center',
            marginBottom: 20,
        },
        imagePreview: {
            width: 200,
            height: 150,
            borderRadius: 8,
            marginBottom: 10,
        },
        imagePlaceholder: {
            width: 200,
            height: 150,
            borderRadius: 8,
            backgroundColor: '#f0f0f0',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 10,
        },
        imagePickerButton: {
            backgroundColor: '#007AFF',
            padding: 12,
            borderRadius: 8,
            width: '50%',
        },
        inputContainer: {
            gap: 8,
        },
        label: {
            fontSize: 16,
            fontWeight: '500',
        },
        input: {
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            padding: 12,
            fontSize: 16,
        },
        textArea: {
            height: 100,
            textAlignVertical: 'top',
        },
        error: {
            color: 'red',
            fontSize: 12,
        },
        submitButton: {
            backgroundColor: '#007AFF',
            padding: 16,
            borderRadius: 8,
            marginTop: 20,
        },
        submitButtonText: {
            color: '#fff',
            textAlign: 'center',
            fontSize: 16,
            fontWeight: 'bold',
        },
        buttonText: {
            color: '#fff',
            textAlign: 'center',
            fontSize: 14,
            fontWeight: '500',
        },
    });

    return (
        <SafeAreaView className={"w-full h-full bg-primary-100"}>
            <ScrollView style={styles.container}>
                <Text style={styles.title}>Add New Product</Text>

                <View style={styles.form}>
                    <View style={styles.imageSection}>
                        {selectedImage ? (
                            <Image
                                source={{ uri: selectedImage.uri }}
                                style={styles.imagePreview}
                            />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <Text>No image selected</Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.imagePickerButton}
                            onPress={handleImagePick}
                        >
                            <Text style={styles.buttonText}>
                                {selectedImage ? 'Change Image' : 'Select Image'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Product Name</Text>
                        <TextInput
                            style={styles.input}
                            value={formValues.name}
                            onChangeText={handleChange('name')}
                            onBlur={handleBlur('name')}
                            placeholder="Enter product name"
                        />
                        {touched.name && errors.name ? (
                            <Text style={styles.error}>{errors.name}</Text>
                        ) : null}
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={formValues.description}
                            onChangeText={handleChange('description')}
                            onBlur={handleBlur('description')}
                            placeholder="Enter product description"
                            multiline
                            numberOfLines={4}
                        />
                        {touched.description && errors.description ? (
                            <Text style={styles.error}>{errors.description}</Text>
                        ) : null}
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Price</Text>
                        <TextInput
                            style={styles.input}
                            value={formValues.price}
                            onChangeText={handleChange('price')}
                            onBlur={handleBlur('price')}
                            placeholder="Enter price"
                            keyboardType="decimal-pad"
                        />
                        {touched.price && errors.price ? (
                            <Text style={styles.error}>{errors.price}</Text>
                        ) : null}
                    </View>

                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitButtonText}>Create Product</Text>
                        )}
                    </TouchableOpacity>
                </View>

               
            </ScrollView>
        </SafeAreaView>
    );
};

export default AddNewProduct;
