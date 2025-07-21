import { DetectorResponse } from '@/interfaces/response-interface';
import axios from 'axios';

export const useDetectObjects = () => {
  const detect = async (imageUri: string): Promise<DetectorResponse> => {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'foto.jpg',
    } as any);

    const response = await axios.post('https://daveobjectdetector-api.onrender.com/detect', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  };

  return { detect };
};