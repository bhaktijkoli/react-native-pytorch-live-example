import * as React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Camera, Image, MobileModel } from 'react-native-pytorch-core';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const model = require('./models/mobilenet_v3_small.ptl');
const ImageClasses = require('./models/MobileNetV3Classes.json');

export default function App() {
  // Component state that holds the detected object class
  const [objectClass, setObjectClass] = React.useState('');

  async function handleImage(image) {
    const { result } = await MobileModel.execute(
      model,
      {
        image,
      },
    );

    if (result.confidence > 0.3) {
      // Get max index (argmax) result to resolve the top class name
      const topClass = ImageClasses[result.maxIdx];

      // Set object class state to be the top class detected in the image
      setObjectClass(topClass);
    } else {
      // Reset the object class if confidence value is low
      setObjectClass('');
    }

    // It is important to release the image to avoid memory leaks
    image.release();
  }

  React.useEffect(() => {
    check(PERMISSIONS.ANDROID.CAMERA).then((result) => {
      if (result !== RESULTS.GRANTED) {
        request(PERMISSIONS.ANDROID.CAMERA)
      }
    })
  }, [])

  return (
    <View
      style={[
        styles.container,
      ]}>
      <Text style={styles.label}>Object: {objectClass}</Text>
      <Camera
        style={styles.camera}
        onFrame={handleImage}
        hideCaptureButton={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    flexGrow: 1,
    padding: 20,
  },
  label: {
    marginBottom: 10,
  },
  camera: {
    flexGrow: 1,
    width: '100%',
  },
});