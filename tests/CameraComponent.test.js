import { render } from '@testing-library/react-native'; // Importa función para renderizar componentes en pruebas
import CameraComponent from '../components/CameraComponent'; // Importa el componente que vamos a testear

// Mock (simulación) del módulo 'expo-camera' para evitar dependencias nativas en tests
jest.mock('expo-camera', () => ({
  CameraType: {                                           // Simula los tipos de cámara usados en el componente
    back: 'back',
    front: 'front',
  },
  CameraView: (props) => <>{props.children}</>,          // Simula el componente CameraView mostrando solo los hijos
  useCameraPermissions: () => [                           // Simula el hook que devuelve permisos de cámara concedidos
    { granted: true },                                    // Objeto de permiso concedido
    jest.fn(),                                            // Función simulada para solicitar permisos (no hace nada)
  ],
}));

test('CameraComponent se renderiza correctamente', () => {
  const toggleCameraFacingMock = jest.fn();               // Crea una función simulada para el prop toggleCameraFacing

  // Renderiza el componente pasando la cámara trasera y la función simulada como props
  const { getByTestId } = render(
    <CameraComponent facing="back" toggleCameraFacing={toggleCameraFacingMock} />
  );

  // Busca en el renderizado el elemento con testID 'camera-container'
  const container = getByTestId('camera-container');

  // Verifica que el elemento exista (el componente se haya renderizado correctamente)
  expect(container).toBeTruthy();
});
