import React from 'react';
import { View, Text } from 'react-native';

const MapView = ({ children, style }: any) => (
  <View style={[{ backgroundColor: '#18181b', alignItems: 'center', justifyContent: 'center' }, style]}>
    <Text style={{ color: '#52525b', fontWeight: 'bold' }}>MAP NOT AVAILABLE ON WEB</Text>
  </View>
);

const Polyline = () => null;
const PROVIDER_GOOGLE = 'google';

export { MapView, Polyline, PROVIDER_GOOGLE };
export default MapView;
