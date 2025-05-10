import { View, Text, Dimensions, ActivityIndicator, TouchableOpacity, StyleSheet, ScrollView, GestureResponderEvent, Alert, I18nManager } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import { RequestType } from '@/types/globals'
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { deleteReq, getReqById } from '@/lib/appwrite'
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps'
import axios from 'axios'
import { FontAwesome5 } from '@expo/vector-icons'
import i18next, { t } from 'i18next'

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY

export interface LocationProps {
    latitude: number,
    longitude: number
  }

interface LatLng {
  latitude: number;
  longitude: number;
}

interface Step {
  startLocation: {
    latLng: LatLng;
  };
}
const Request = () => {
  const { width, height } = Dimensions.get('screen')
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const [isRTL , setIsRTL] = useState(false);
   const pathname = usePathname();
  useEffect(() => {
      // Check if current language is Arabic to set RTL
      const currentLanguage = i18next.language;
      
      const isArabicLanguage = currentLanguage === 'ar';
      setIsRTL(isArabicLanguage);
      
      
    }, [pathname]);
   
  
  const [request, setRequest] = useState<RequestType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mapError, setMapError] = useState<string | null>(null)
  const [region, setRegion] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  })
  const [routeCoordinates, setRouteCoordinates] = useState<Array<{ latitude: number; longitude: number }>>([])

  // Fetch route coordinates using Google Directions API
  const fetchRouteCoordinates = useCallback(async (origin: LocationProps, destination: LocationProps) => {
    if (!GOOGLE_MAPS_API_KEY) {
      setMapError('Google Maps API key is missing')
      return
    }

    try {
      const response = await axios.post(
        'https://routes.googleapis.com/directions/v2:computeRoutes',
        {
          origin: {
            location: {
              latLng: {
                latitude: origin.latitude,
                longitude: origin.longitude
              }
            }
          },
          destination: {
            location: {
              latLng: {
                latitude: destination.latitude,
                longitude: destination.longitude
              }
            }
          },
          travelMode: "DRIVE",
          languageCode: "en-US",
          units: "IMPERIAL"
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
            'X-Goog-FieldMask': 'routes.legs.steps.endLocation.latLng,routes.legs.steps.startLocation.latLng',
          }
        }
      )

      if (response.data?.routes?.[0]?.legs?.[0]?.steps) {
        const steps = response.data.routes[0].legs[0].steps
        

        const coordinates: LatLng[] = steps.map((step: Step) => ({
          latitude: step.startLocation.latLng.latitude,
          longitude: step.startLocation.latLng.longitude,
        }));

        setRouteCoordinates([
          { latitude: origin.latitude, longitude: origin.longitude },
          ...coordinates,
          { latitude: destination.latitude, longitude: destination.longitude }
        ])
      } else {
        setMapError('No route found')
      }
    } catch (error) {
      console.error("Error fetching route:", error)
      setMapError('Failed to load route data')
    }
  }, [GOOGLE_MAPS_API_KEY])

  // Fetch request data
  useEffect(() => {
    const fetchRequestData = async () => {
      if (!id) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const result = await getReqById(id as string)
        
        if (result) {
          setRequest(result as unknown as RequestType)
          
          // Set map region
          const newRegion = {
            latitude: (result.pickUpLan + result.destinyLan) / 2,
            longitude: (result.pickUpLon + result.destinyLon) / 2,
            latitudeDelta: Math.abs(result.destinyLan - result.pickUpLan) * 1.5,
            longitudeDelta: Math.abs(result.destinyLon - result.pickUpLon) * 1.5,
          }
          setRegion(newRegion)
          
          // Fetch route coordinates
          const pickUp = { latitude: result.pickUpLan, longitude: result.pickUpLon }
          const destiny = { latitude: result.destinyLan, longitude: result.destinyLon }
          await fetchRouteCoordinates(pickUp, destiny)
        }
      } catch (error) {
        console.error("Error fetching request:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRequestData()
  }, [id, fetchRouteCoordinates])

  const getStatusColor = (status: RequestType['status']) => {
    switch (status) {
      case 'pending': return '#f39c12'
      case 'accepted': return '#3498db'
      case 'onRoad': return '#9b59b6'
      case 'delivered': return '#2ecc71'
      default: return '#95a5a6'
    }
  }

  const getStatusText = (status: RequestType['status']) => {
    switch (status) {
      case 'pending': return 'Waiting for driver'
      case 'accepted': return 'Driver has accepted'
      case 'onRoad': return 'Driver is on the way'
      case 'delivered': return 'Package delivered'
      default: return 'Unknown status'
    }
  }

  const handleBack = () => {
    router.back()
  }

  async function handleDelte(event: GestureResponderEvent): Promise<void> {
    try {
      await deleteReq(id as string)
      router.replace('/(root)/home')
    } catch (error) {
      Alert.alert(t('error'), 'unexpected error happened !')
    }
  }

 

    

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
        >
          <FontAwesome5 
            name={isRTL ? "arrow-right" : "arrow-left"} 
            size={20} 
            color="#2c3e50" 
          />
        </TouchableOpacity>
        <View style={styles.spacer} />
        <Text style={styles.headerTitle}>{t('Request Details')}</Text>
        <View style={styles.spacer} />
        <TouchableOpacity style={styles.backButton} onPress={handleDelte}>
          <Text style={styles.delete}>{t('Delete')}</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>{t('Loading request details...')}</Text>
        </View>
      ) : !request ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('Request not found')}</Text>
          <TouchableOpacity style={styles.backButtonLarge} onPress={handleBack}>
            <Text style={styles.backButtonText}>{t('Go Back')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {/* Map Section */}
          <View style={styles.mapContainer}>
            {mapError ? (
              <View style={styles.mapErrorContainer}>
                <Text style={styles.mapErrorText}>{mapError}</Text>
              </View>
            ) : (
              <MapView
                provider={PROVIDER_GOOGLE}
                style={{ width: width, height: height * 0.4 }}
                region={region}
                showsUserLocation={true}
              >
                {/* Pickup Marker */}
                <Marker
                  coordinate={{
                    latitude: request.pickUpLan,
                    longitude: request.pickUpLon,
                  }}
                  pinColor="#e74c3c"
                  title={t('Pickup Location')}
                  description={t('Package pickup point')}
                />

                {/* Destination Marker */}
                <Marker
                  coordinate={{
                    latitude: request.destinyLan,
                    longitude: request.destinyLon,
                  }}
                  pinColor="#2ecc71"
                  title={t('Destination')}
                  description={t('Package delivery point')}
                />

                {/* Route Line */}
                {routeCoordinates.length > 0 && (
                  <Polyline
                    coordinates={routeCoordinates}
                    strokeWidth={4}
                    strokeColor="#3498db"
                  />
                )}
              </MapView>
            )}
          </View>

          {/* Request Details */}
          <View style={styles.detailsContainer}>
            {/* Request ID and Status */}
            <View style={styles.card}>
              <View style={[styles.requestIdContainer, isRTL && styles.rowReverse]}>
                <Text style={styles.requestIdLabel}>{t('Request ID')}:</Text>
                <Text style={styles.requestId}>{request.$id || 'N/A'}</Text>
              </View>
              
              <View style={[styles.statusContainer, { backgroundColor: getStatusColor(request.status) }]}>
                <FontAwesome5 
                  name={request.status === 'delivered' ? 'check-circle' : 'clock'} 
                  size={16} 
                  color="white" 
                  style={[styles.statusIcon, isRTL && styles.statusIconRtl]} 
                />
                <View style={[isRTL && styles.statusTextRtlContainer]}>
                  <Text style={[styles.statusText, isRTL && styles.textAlignRight]}>{t(`request.status.${request.status}`)}</Text>
                  <Text style={[styles.statusDescription, isRTL && styles.textAlignRight]}>{t(getStatusText(request.status))}</Text>
                </View>
              </View>
            </View>
            
            
            
            {/* Package Details */}
            <View style={styles.card}>
              <Text style={[styles.cardTitle, isRTL && styles.textAlignRight]}>{t('package.details')}</Text>
              <View style={styles.packageContainer}>
                <Text style={[styles.packageDetails, isRTL && styles.textAlignRight]}>
                  {request.packageDetails || t('No details provided')}
                </Text>
              </View>
              <View style={[styles.priceContainer, isRTL && styles.rowReverse]}>
                <Text style={styles.priceLabel}>{t('Price')}:</Text>
                <Text style={styles.priceValue}>{t('currency.dzd')}{request.price.toFixed(2)}</Text>
              </View>
            </View>

            {/* Location Details */}
            <View style={styles.card}>
              <Text style={[styles.cardTitle, isRTL && styles.textAlignRight]}>{t('Location Details')}</Text>
              <View style={styles.locationContainer}>
                <View style={[styles.locationItem, isRTL && styles.rowReverse]}>
                  <View style={[styles.locationDot, isRTL && styles.locationDotRtl]} />
                  <View style={[styles.locationTextContainer, isRTL && styles.locationTextContainerRtl]}>
                    <Text style={[styles.locationLabel, isRTL && styles.textAlignRight]}>{t('Pickup Location')}</Text>
                    <Text style={[styles.locationCoordinates, isRTL && styles.textAlignRight]}>
                      {request.pickUpLan.toFixed(6)}, {request.pickUpLon.toFixed(6)}
                    </Text>
                  </View>
                </View>
                
                <View style={[styles.locationDivider, isRTL && styles.locationDividerRtl]} />
                
                <View style={[styles.locationItem, isRTL && styles.rowReverse]}>
                  <View style={[styles.locationDot, styles.destinationDot, isRTL && styles.locationDotRtl]} />
                  <View style={[styles.locationTextContainer, isRTL && styles.locationTextContainerRtl]}>
                    <Text style={[styles.locationLabel, isRTL && styles.textAlignRight]}>{t('Destination')}</Text>
                    <Text style={[styles.locationCoordinates, isRTL && styles.textAlignRight]}>
                      {request.destinyLan.toFixed(6)}, {request.destinyLon.toFixed(6)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* User and Driver Info */}
            <View style={styles.card}>
              <Text style={[styles.cardTitle, isRTL && styles.textAlignRight]}>{t('Delivery Information')}</Text>
              <View style={[styles.infoRow, isRTL && styles.rowReverse]}>
                <FontAwesome5 name="user" size={16} color="#7f8c8d" style={[styles.infoIcon, isRTL && styles.infoIconRtl]} />
                <Text style={[styles.infoLabel, isRTL && { textAlign: isRTL ? 'right' : 'left' }]}>{t('Customer')}:</Text>
                <Text style={[styles.infoValue, isRTL && styles.textAlignRight]}>{request.user || 'N/A'}</Text>
              </View>

              {request.driverid && (
                <View style={[styles.infoRow, isRTL && styles.rowReverse]}>
                  <FontAwesome5 name="id-badge" size={16} color="#7f8c8d" style={[styles.infoIcon, isRTL && styles.infoIconRtl]} />
                  <Text style={[styles.infoLabel, isRTL && { textAlign: isRTL ? 'right' : 'left' }]}>{t('Driver ID')}:</Text>
                  <Text style={[styles.infoValue, isRTL && styles.textAlignRight]}>{request.driverid}</Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  delete: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'red',
  },
  spacer: {
    width: 36,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#7f8c8d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    marginBottom: 20,
  },
  backButtonLarge: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  mapContainer: {
    height: Dimensions.get('window').height * 0.4,
    width: '100%',
  },
  mapErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  mapErrorText: {
    color: '#e74c3c',
    textAlign: 'center',
    padding: 20,
  },
  detailsContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestIdContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  requestIdLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginRight: 4,
  },
  requestId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495e',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  statusIconRtl: {
    marginRight: 0,
    marginLeft: 12,
  },
  statusTextRtlContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  MarkComplete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  statusIcon: {
    marginRight: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusDescription: {
    color: 'white',
    fontSize: 12,
    marginTop: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  packageContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  packageDetails: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  priceLabel: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  locationContainer: {
    paddingVertical: 8,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e74c3c',
    marginRight: 12,
  },
  locationDotRtl: {
    marginRight: 0,
    marginLeft: 12,
  },
  destinationDot: {
    backgroundColor: '#2ecc71',
  },
  locationTextContainer: {
    flex: 1,
  },
  locationTextContainerRtl: {
    alignItems: 'flex-end',
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  locationCoordinates: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  locationDivider: {
    height: 20,
    width: 1,
    backgroundColor: '#bdc3c7',
    marginLeft: 6,
    marginVertical: 4,
  },
  locationDividerRtl: {
    marginLeft: 0,
    marginRight: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    marginRight: 8,
    width: 20,
  },
  infoIconRtl: {
    marginRight: 0,
    marginLeft: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
  },
  textAlignRight: {
    textAlign: 'right',
  }
});

export default Request;
