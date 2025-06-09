import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  facing: CameraType | undefined;
  toggleCameraFacing: () => void;
}

export type CameraComponentHandle = {
  takePhoto: () => Promise<string | null>; // URI
};

const CameraComponent = forwardRef<CameraComponentHandle, Props>(({ facing, toggleCameraFacing }, ref) => {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  useImperativeHandle(ref, () => ({
    takePhoto: async () => {
      if (cameraRef.current) {
        try {
          const photo = await cameraRef.current.takePictureAsync();
          console.log('📸 Foto capturada:', photo.uri);
          return photo.uri;
        } catch (error) {
          console.error('❌ Error al tomar la foto:', error);
          return null;
        }
      }
      return null;
    },
  }));

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant permission" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
});

export default CameraComponent;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        margin: 64,
    },
    button: {
        flex: 1,
        alignSelf: 'flex-end',
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        opacity: 0
    },
});