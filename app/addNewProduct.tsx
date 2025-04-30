import {ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {Formik} from "formik";
import React, {useState} from "react";
import {ProductType} from "@/types/globals";
import * as Yup from "yup";
import * as ImagePicker from "expo-image-picker";
interface FormValues extends Omit<ProductType, '$id'> {
    price: number; // Using string for input handling
}
const validationSchema = Yup.object().shape({
    name: Yup.string()
        .required('Product name is required')
        .min(2, 'Name must be at least 2 characters'),
    description: Yup.string()
        .required('Product description is required')
        .min(10, 'Description must be at least 10 characters'),
    price: Yup.number()
        .required('Price is required')
        .positive('Price must be a positive number'),
    coverpic: Yup.string()
        .required('Product image is required'),
});
const AddNewProduct = () => {
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const initialValues: FormValues = {
        name: '',
        description: '',
        price: 0,
        coverpic: '',
        storeId: '', // Optional, can be handled based on your app's logic
    };

    // Function to handle image picking
    const handleImagePick = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permissionResult.granted) {
                alert('Permission to access gallery was denied');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled) {
                setSelectedImage(result.assets[0].uri);
                return result.assets[0].uri;
            }
        } catch (error) {
            console.error('Error picking image:', error);
            alert('Error picking image');
        }
        return null;
    };

    // Function to upload image to Appwrite
    const uploadImageToAppwrite = async (imageUri: string): Promise<string> => {
        try {
            // TODO: Implement image upload to Appwrite storage
            // 1. Convert imageUri to appropriate format (Blob/File)
            // 2. Upload to Appwrite storage bucket
            // 3. Return the file ID or URL
            throw new Error('Not implemented');
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    };

    // Function to create product in database
    const createProduct = async (productData: Omit<ProductType, '$id'>): Promise<void> => {
        try {
            // TODO: Implement product creation in database
            // Use Appwrite SDK to create the product
            throw new Error('Not implemented');
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    };

    const handleSubmit = async (values: FormValues) => {
        try {
            setLoading(true);

            if (!selectedImage) {
                alert('Please select an image');
                return;
            }

            // Upload image and get URL
            const imageUrl = await uploadImageToAppwrite(selectedImage);

            // Prepare product data
            const productData: Omit<ProductType, '$id'> = {
                name: values.name,
                description: values.description,
                price: Number(values.price),
                coverpic: imageUrl,
                storeId: values.storeId,
            };

            // Create product
            await createProduct({
                name: values.name,
                description: values.description,
                price: Number(values.price),
                coverpic: imageUrl,
                storeId: values.storeId,
            });

            // Reset form and image
            setSelectedImage(null);
            alert('Product created successfully!');

        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Error creating product');
        } finally {
            setLoading(false);
        }
    };
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            padding: 16,
            backgroundColor: '#fff',
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
        <>
            <ScrollView style={styles.container}>
                <Text style={styles.title}>Add New Product</Text>

                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ handleChange, handleSubmit, values, errors, touched }) => (
                        <View style={styles.form}>
                            <View style={styles.imageSection}>
                                {selectedImage ? (
                                    <Image
                                        source={{ uri: selectedImage }}
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
                                    value={values.name}
                                    onChangeText={handleChange('name')}
                                    placeholder="Enter product name"
                                />
                                {touched.name && errors.name && (
                                    <Text style={styles.error}>{errors.name}</Text>
                                )}
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Description</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={values.description}
                                    onChangeText={handleChange('description')}
                                    placeholder="Enter product description"
                                    multiline
                                    numberOfLines={4}
                                />
                                {touched.description && errors.description && (
                                    <Text style={styles.error}>{errors.description}</Text>
                                )}
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Price</Text>
                                <TextInput
                                    style={styles.input}
                                    value={values.price.toString()}
                                    onChangeText={handleChange('price')}
                                    placeholder="Enter price"
                                    keyboardType="decimal-pad"
                                />
                                {touched.price && errors.price && (
                                    <Text style={styles.error}>{errors.price}</Text>
                                )}
                            </View>

                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={() => handleSubmit()}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Create Product</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </Formik>
            </ScrollView>
        </>
    )
}

export default AddNewProduct;
