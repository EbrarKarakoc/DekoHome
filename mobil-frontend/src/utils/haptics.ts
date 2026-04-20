import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

function canUseHaptics() {
  return Platform.OS !== 'web';
}

export async function hapticSuccess(): Promise<void> {
  if (!canUseHaptics()) {
    return;
  }

  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export async function hapticError(): Promise<void> {
  if (!canUseHaptics()) {
    return;
  }

  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}

export async function hapticTap(): Promise<void> {
  if (!canUseHaptics()) {
    return;
  }

  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}
