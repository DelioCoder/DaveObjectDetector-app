import { useDetectObjects } from '@/hooks/useUploadImage';
import { translate } from '@/utils/translation';
import * as Speech from 'expo-speech';
import {
    ExpoSpeechRecognitionModule,
    useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import React from 'react';
import { CameraComponentHandle } from './CameraComponent';
interface Props {
    setRecognizing: React.Dispatch<React.SetStateAction<boolean>>;
    setIsListening: React.Dispatch<React.SetStateAction<boolean>>;
    cameraRef: React.RefObject<CameraComponentHandle | null>;
    setDetectedLabels: React.Dispatch<React.SetStateAction<string[]>>;
}
const SpeechComponent = ({ setRecognizing, setIsListening, cameraRef, setDetectedLabels }: Props) => {


    const { detect } = useDetectObjects();

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
                    const labels = response.objects.map(obj => translate(obj.label));
                    setDetectedLabels(labels);

                    const spokenText = labels.length > 0
                        ? `He detectado: ${labels.join(', ')}`
                        : 'No he detectado ningún objeto';

                    Speech.speak(spokenText, {
                        language: 'es-PE',
                        rate: 1.0,
                    });

                } catch (error) {
                    console.error(error);
                    Speech.speak('Hubo un error al analizar la imagen', { language: 'es-PE' });
                }
            }
        }
    });
    useSpeechRecognitionEvent('error', (event) => {
        console.log('Error code:', event.error, 'message:', event.message);
    });

    return null;
}

export default SpeechComponent;