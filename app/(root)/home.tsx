import { View, Text, TouchableHighlight } from 'react-native'
import React from 'react'
import { useAuthContext } from '@/lib/authContext'

const Home = () => {
  const {userData , logout} = useAuthContext()
  return (
    <View>
      <TouchableHighlight onPress={logout}><Text>logout</Text></TouchableHighlight>
      <Text>{userData?.$id}</Text>
    </View>
  )
}

export default Home