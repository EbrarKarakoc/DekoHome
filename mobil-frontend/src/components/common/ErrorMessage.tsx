import { Pressable, Text, View } from 'react-native';

import Colors from '@constants/colors';

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void | Promise<void>;
}

export function ErrorMessage({
  message = 'Bir sorun olustu. Lutfen tekrar deneyin.',
  onRetry,
}: ErrorMessageProps) {
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: '#FECACA',
        borderRadius: 14,
        padding: 14,
        backgroundColor: '#FEF2F2',
      }}
    >
      <Text style={{ color: '#991B1B', fontWeight: '700' }}>Bir hata olustu</Text>
      <Text style={{ color: '#B91C1C', marginTop: 4 }}>{message}</Text>

      {onRetry ? (
        <Pressable
          onPress={onRetry}
          style={{
            marginTop: 10,
            alignSelf: 'flex-start',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: Colors.error,
            backgroundColor: '#FEE2E2',
          }}
        >
          <Text style={{ color: Colors.error, fontWeight: '700' }}>Tekrar Dene</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
