import { Pressable, Text } from 'react-native';

interface CategoryChipProps {
  name: string;
  isActive: boolean;
  onPress: () => void;
}

export default function CategoryChip({ name, isActive, onPress }: CategoryChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`px-6 py-2.5 rounded-full mr-3 border ${
        isActive 
          ? 'bg-primary-600 border-primary-600 shadow-md shadow-primary-600/20' 
          : 'bg-white border-slate-200'
      }`}
    >
      <Text
        className={`text-xs font-inter-bold transition-all ${
          isActive ? 'text-white' : 'text-slate-500'
        }`}
      >
        {name}
      </Text>
    </Pressable>
  );
}
