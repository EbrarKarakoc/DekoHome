import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  touchPos: { x: number; y: number } | null;
  status: 'idle' | 'passwordVisible' | 'error' | 'success';
}

const CHARACTERS = [
  { id: 'char1', color: '#6c5ce7', shape: 'square', size: 60, delay: 0 },
  { id: 'char3', color: '#ff7043', shape: 'circle', size: 50, delay: 120, offset: 5 }, // Orange half-circle-like
  { id: 'char2', color: '#1a1a2e', shape: 'square', size: 55, delay: 220 },
  { id: 'char4', color: '#ffd600', shape: 'square', size: 60, delay: 340 },
];

const Character = ({
  char,
  touchPos,
  status,
}: {
  char: typeof CHARACTERS[0];
  touchPos: Props['touchPos'];
  status: Props['status'];
}) => {
  const dropY = useSharedValue(-200);
  const scale = useSharedValue(1);
  const lookRotation = useSharedValue(0);
  const shakeX = useSharedValue(0);
  
  // Eyes
  const pupilX = useSharedValue(0);
  const pupilY = useSharedValue(0);

  // Expressions
  const mouthScaleY = useSharedValue(1);
  const mouthScaleX = useSharedValue(1);
  const mouthBorderRadius = useSharedValue(8);
  const browRotationLeft = useSharedValue(0);
  const browRotationRight = useSharedValue(0);

  useEffect(() => {
    // Drop animation on mount
    dropY.value = withDelay(
      char.delay,
      withSpring(0, { damping: 12, stiffness: 100 }, () => {
        scale.value = withSequence(
          withTiming(1.2, { duration: 150 }),
          withTiming(1, { duration: 150 })
        );
      })
    );
  }, []);

  useEffect(() => {
    // Status animations
    if (status === 'passwordVisible') {
      lookRotation.value = withTiming(-25, { duration: 400 });
      pupilX.value = withTiming(-4);
    } else if (status === 'error') {
      lookRotation.value = withTiming(0);
      shakeX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
      // Sad face
      mouthScaleY.value = withTiming(-1);
      browRotationLeft.value = withTiming(15);
      browRotationRight.value = withTiming(-15);

      setTimeout(() => {
        if (status === 'error') { // Auto recover visuals
           mouthScaleY.value = withTiming(1);
           browRotationLeft.value = withTiming(0);
           browRotationRight.value = withTiming(0);
        }
      }, 700);

    } else if (status === 'success') {
      lookRotation.value = withTiming(0);
      // Happy face
      mouthScaleX.value = withTiming(2);
      mouthScaleY.value = withTiming(1.5);
      browRotationLeft.value = withTiming(-10);
      browRotationRight.value = withTiming(10);
      
      // Jump
      dropY.value = withSequence(
          withTiming(-20, { duration: 150 }),
          withTiming(0, { duration: 150 })
      );
    } else {
      // Idle
      lookRotation.value = withTiming(0, { duration: 400 });
      mouthScaleX.value = withTiming(1);
      mouthScaleY.value = withTiming(1);
      browRotationLeft.value = withTiming(0);
      browRotationRight.value = withTiming(0);
    }
  }, [status]);

  useEffect(() => {
    // Eye tracking logic
    if (status === 'passwordVisible' || status === 'error' || status === 'success') return;

    if (touchPos) {
      // Very basic approximation for eye movement without knowing exact absolute on-screen pos
      const cx = SCREEN_WIDTH / 2;
      const dx = touchPos.x - cx;
      const dy = touchPos.y - 200; // approximate Y position of characters
      
      // Head slight rotation
      const maxRot = 8;
      const ratio = dx / cx;
      lookRotation.value = withTiming(ratio * maxRot, { duration: 100 });

      // Pupil movement
      const maxPupilMove = 3;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0) {
        pupilX.value = withTiming((dx / dist) * Math.min(maxPupilMove, dist * 0.1), { duration: 50 });
        pupilY.value = withTiming((dy / dist) * Math.min(maxPupilMove, dist * 0.1), { duration: 50 });
      }
    } else {
        pupilX.value = withTiming(0);
        pupilY.value = withTiming(0);
        lookRotation.value = withTiming(0);
    }
  }, [touchPos, status]);

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: dropY.value },
      { scale: scale.value },
      { rotate: `${lookRotation.value}deg` },
      { translateX: shakeX.value }
    ],
  }));

  const pupilStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: pupilX.value },
      { translateY: pupilY.value }
    ]
  }));

  const mouthStyle = useAnimatedStyle(() => ({
      transform: [
          { scaleX: mouthScaleX.value },
          { scaleY: mouthScaleY.value }
      ]
  }));

  const browLeftStyle = useAnimatedStyle(() => ({
      transform: [
          { rotate: `${browRotationLeft.value}deg` }
      ]
  }));

  const browRightStyle = useAnimatedStyle(() => ({
      transform: [
          { rotate: `${browRotationRight.value}deg` }
      ]
  }));

  return (
    <Animated.View style={[styles.charContainer, { marginBottom: char.offset || 0 }]}>
      <Animated.View
        style={[
          styles.charBody,
          { 
              backgroundColor: char.color, 
              width: char.size, 
              height: char.shape === 'circle' ? char.size / 1.5 : char.size,
              borderRadius: char.shape === 'circle' ? char.size : 12,
              borderBottomLeftRadius: char.shape === 'circle' ? 0 : 12,
              borderBottomRightRadius: char.shape === 'circle' ? 0 : 12,
          },
          bodyStyle,
        ]}
      >
        <View style={styles.brows}>
          <Animated.View style={[styles.brow, browLeftStyle]} />
          <Animated.View style={[styles.brow, browRightStyle]} />
        </View>
        <View style={styles.eyes}>
          <View style={styles.eye}>
            <Animated.View style={[styles.pupil, pupilStyle]} />
          </View>
          <View style={styles.eye}>
            <Animated.View style={[styles.pupil, pupilStyle]} />
          </View>
        </View>
        <Animated.View style={[styles.mouth, mouthStyle]} />
      </Animated.View>
    </Animated.View>
  );
};

export default function LoginCharacters({ touchPos, status }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.stage}>
        {CHARACTERS.map((char) => (
          <Character key={char.id} char={char} touchPos={touchPos} status={status} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 180,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
    backgroundColor: '#FAFAF9',
    overflow: 'visible',
  },
  stage: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  charContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  charBody: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  brows: {
    flexDirection: 'row',
    gap: 16,
    position: 'absolute',
    top: 10,
  },
  brow: {
    width: 14,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 2,
  },
  eyes: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  eye: {
    width: 14,
    height: 14,
    backgroundColor: '#fff',
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pupil: {
    width: 6,
    height: 6,
    backgroundColor: '#000',
    borderRadius: 3,
  },
  mouth: {
    width: 12,
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    marginTop: 6,
  },
});
