import CameraComponent, { CameraComponentHandle } from '@/components/CameraComponent';
import { useDetectObjects } from '@/hooks/useUploadImage';
import { translations } from '@/utils/translation';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import Octicons from '@expo/vector-icons/Octicons';
import { CameraType } from 'expo-camera';
import * as Speech from 'expo-speech';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import React, { useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Home() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [recognizing, setRecognizing] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [detectedLabels, setDetectedLabels] = useState<string[]>([]);
  const cameraRef = useRef<CameraComponentHandle>(null);

  const { detect } = useDetectObjects();

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  useSpeechRecognitionEvent('start', () => { setRecognizing(true); setIsListening(true) });
  useSpeechRecognitionEvent('end', () => { setRecognizing(false); setIsListening(false) });
  useSpeechRecognitionEvent('result', async (event) => {
    const text = event.results[0]?.transcript?.toLowerCase() || '';

    console.log('Texto reconocido:', text);

    if (text.includes('dave') && text.includes('qué ves al frente')) {
      console.log('Frase detectada: Dave, ¿qué ves al frente mío?');
      ExpoSpeechRecognitionModule.stop();
      const uri = await cameraRef.current?.takePhoto();
      if (uri) {
        try {
          Speech.speak('Procesando imagen, por favor espera...', {
            language: 'es-PE',
            rate: 1.0,
          });
          const response = await detect(uri);
          const labels = response.objects.map((object) => translations[object.label] || object.label);
          setDetectedLabels(labels);

          const spokenText = labels.length > 0
            ? `He detectado: ${labels.join(', ')}`
            : 'No he detectado ningún objeto';

          Speech.speak(spokenText, {
            language: 'es-PE',
            rate: 1.0,
          });
        } catch (error) {
          console.error('Error al detectar objetos:', error);
          Speech.speak('Hubo un error al analizar la imagen', { language: 'es-PE' });
        }
      }
    }
  });
  useSpeechRecognitionEvent('error', (event) => {
    console.log('Error code:', event.error, 'message:', event.message);
  });

  const handleStart = async () => {
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) {
      console.warn('Permisos no otorgados', result);
      return;
    }
    ExpoSpeechRecognitionModule.start({
      lang: 'es-PE',
      interimResults: false,
      continuous: false,
    });
  };

  const handleStop = () => {
    ExpoSpeechRecognitionModule.stop();
  };

  return (
    <View style={styles.container}>
      <CameraComponent ref={cameraRef} toggleCameraFacing={toggleCameraFacing} facing={facing} />

      <TouchableOpacity onPress={toggleCameraFacing} style={styles.flipButton}>
        <MaterialCommunityIcons name="camera-flip-outline" size={44} color="#e7e5e4" />
      </TouchableOpacity>

      <View style={styles.centerIcon}>
        <Octicons name="screen-full" size={158} color="#e7e5e4" />
      </View>

      <TouchableOpacity onPress={recognizing ? handleStop : handleStart} style={styles.voiceButton}>
        <View style={styles.voiceInner}>
          {isListening ? (
            <MaterialIcons name="record-voice-over" size={58} color="#e7e5e4" />
          ) : (
            <MaterialIcons name="keyboard-voice" size={58} color="#e7e5e4" />
          )}

        </View>
      </TouchableOpacity>

      {detectedLabels.length > 0 && (
        <View style={styles.resultBox}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Objetos detectados:</Text>
          {detectedLabels.map((label, index) => (
            <Text key={index} style={{ color: 'white' }}>{label}</Text>
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3f3f46',
    justifyContent: 'center',
  },
  flipButton: {
    position: 'absolute',
    left: 16,
    top: 80,
  },
  centerIcon: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: [{ translateX: -79 }, { translateY: -79 }],
  },
  voiceButton: {
    position: 'absolute',
    bottom: 48,
    right: 0,
    width: '100%',
    alignItems: 'center',
  },
  voiceInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultBox: {
    position: 'absolute',
    bottom: 120,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
    borderRadius: 10,
  },
});
