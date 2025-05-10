import { View, Text, Image, TouchableOpacity, Dimensions, StyleSheet, I18nManager } from 'react-native'
import React, { useEffect, useState } from 'react'
import { RequestType } from '@/types/globals'
import { images } from '@/constants'
import { useTranslation } from 'react-i18next'
import i18next, { t } from 'i18next'

interface Props {
  request: RequestType
  onPress: () => void
}

const RequestsCard = ({ request, onPress }: Props) => {
  const { width } = Dimensions.get('screen')
  const [isRTL , setIsRTL] = useState(false);
    useEffect(() => {
        // Check if current language is Arabic to set RTL
        const currentLanguage = i18next.language;
        console.log(currentLanguage);
        
        const isArabicLanguage = currentLanguage === 'ar';
        setIsRTL(isArabicLanguage);
        
        
      }, [i18next.language]);
  
      const styles = StyleSheet.create({
        container: {
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          padding: 16,
          marginVertical: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        },
        header: {
          flexDirection: isRTL ? 'row-reverse' : 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: '#F0F0F0',
        },
        idContainer: {
          flexDirection: isRTL ? 'row-reverse' : 'row',
          alignItems: 'center',
        },
        idLabel: {
          fontSize: 14,
          fontWeight: '600',
          color: '#666',
          marginRight: isRTL ? 0 : 4,
          marginLeft: isRTL ? 4 : 0,
        },
        idValue: {
          fontSize: 14,
          color: '#333',
        },
        statusContainer: {
          flexDirection: isRTL ? 'row-reverse' : 'row',
          alignItems: 'center',
          backgroundColor: '#F5F5F5',
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 12,
        },
        statusText: {
          fontSize: 14,
          fontWeight: '600',
          color: '#555',
          marginRight: isRTL ? 0 : 4,
          marginLeft: isRTL ? 4 : 0,
          textTransform: 'capitalize',
        },
        statusIcon: {
          width: 16,
          height: 16,
        },
        infoRow: {
          flexDirection: isRTL ? 'row-reverse' : 'row',
          marginBottom: 12,
        },
        label: {
          fontSize: 14,
          fontWeight: '600',
          color: '#666',
          marginRight: isRTL ? 0 : 4,
          marginLeft: isRTL ? 4 : 0,
          width: 60,
          textAlign: isRTL ? 'right' : 'left',
        },
        value: {
          fontSize: 14,
          color: '#333',
          flex: 1,
          textAlign: isRTL ? 'right' : 'left',
        },
        locationContainer: {
          flexDirection: isRTL ? 'row-reverse' : 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#F8F8F8',
          borderRadius: 8,
          padding: 12,
          marginBottom: 12,
        },
        locationSection: {
          flex: 1,
          alignItems: isRTL ? 'flex-end' : 'flex-start',
        },
        locationTitle: {
          fontSize: 14,
          fontWeight: '600',
          color: '#555',
          marginBottom: 4,
          textAlign: isRTL ? 'right' : 'left',
        },
        coordinates: {
          fontSize: 12,
          color: '#777',
          textAlign: isRTL ? 'right' : 'left',
        },
        arrowIcon: {
          width: 20,
          height: 20,
          marginHorizontal: 8,
        },
        detailsContainer: {
          marginBottom: 12,
          padding: 10,
          backgroundColor: '#F8F8F8',
          borderRadius: 8,
        },
        detailsTitle: {
          fontSize: 14,
          fontWeight: '600',
          color: '#555',
          marginBottom: 4,
          textAlign: isRTL ? 'right' : 'left',
        },
        detailsText: {
          fontSize: 13,
          color: '#555',
          textAlign: isRTL ? 'right' : 'left',
        },
        priceContainer: {
          alignItems: isRTL ? 'flex-start' : 'flex-end',
        },
        priceValue: {
          fontSize: 16,
          fontWeight: '700',
          color: '#2E7D32',
        },
      });
      
  const getStatusIcon = () => {
    switch (request.status) {
      case 'pending':
        return images.pending
      case 'accepted':
        return images.accepted
      case 'onRoad':
        return images.onroad
      case 'delivered':
        return images.delivered
      default:
        return null
    }
  }
  
  const getStatusText = () => {
    switch (request.status) {
      case 'pending':
        return t('status.pending')
      case 'accepted':
        return t('status.accepted')
      case 'onRoad':
        return t('status.onRoad')
      case 'delivered':
        return t('status.delivered')
      default:
        return request.status
    }
  }
  
  return (
    <TouchableOpacity 
      style={[styles.container, { width: width * 0.9 }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.idContainer}>
          <Text style={styles.idLabel}>{t('request.id')}:</Text>
          <Text style={styles.idValue}>{request.$id}</Text>
        </View>
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
          {getStatusIcon() && <Image source={getStatusIcon()} style={styles.statusIcon} />}
        </View>
      </View>
      
      {/* Driver Info */}
      <View style={styles.infoRow}>
        <Text style={styles.label}>{t('request.driver')}:</Text>
        <Text style={styles.value}>{request.driverid ?? t('request.noDriverYet')}</Text>
      </View>
      
      {/* Location Info */}
      <View style={styles.locationContainer}>
        <View style={styles.locationSection}>
          <Text style={styles.locationTitle}>{t('location.pickUp')}</Text>
          <Text style={styles.coordinates}>
            {request.pickUpLan}, {request.pickUpLon}
          </Text>
        </View>
        
        <Image 
          source={images.rightArrow} 
          style={[
            styles.arrowIcon, 
            isRTL && { transform: [{ scaleX: -1 }] }
          ]} 
        />
        
        <View style={styles.locationSection}>
          <Text style={styles.locationTitle}>{t('location.destination')}</Text>
          <Text style={styles.coordinates}>
            {request.destinyLan}, {request.destinyLon}
          </Text>
        </View>
      </View>
      
      {/* Package Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.detailsTitle}>{t('package.details')}</Text>
        <Text style={styles.detailsText}>{request.packageDetails}</Text>
      </View>
      
      {/* Price */}
      <View style={styles.priceContainer}>
        <Text style={styles.priceValue}>{request.price} {t('currency.dzd')}</Text>
      </View>
    </TouchableOpacity>
  )
}


export default RequestsCard
