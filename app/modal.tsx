import { Link } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={{ color: '#fff' }}>This is a modal</Text>
      <Link href="/" dismissTo style={styles.link}>
        <Text style={{ color: '#0df2f2' }}>Go to home screen</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#09090b',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
