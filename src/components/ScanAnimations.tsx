import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { Colors } from "../theme";

interface PulseRingProps {
  size?: number;
  color?: string;
  rings?: number;
}

export const PulseRing: React.FC<PulseRingProps> = ({
  size = 200,
  color = Colors.secondary,
  rings = 3,
}) => {
  const animations = Array.from(
    { length: rings },
    () => useRef(new Animated.Value(0)).current,
  );

  useEffect(() => {
    const createAnimation = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      );

    const anims = animations.map((anim, i) => createAnimation(anim, i * 600));
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, []);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {animations.map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            styles.ring,
            {
              width: size + i * 30,
              height: size + i * 30,
              borderColor: color,
              borderRadius: (size + i * 30) / 2,
              opacity: anim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.6, 0.3, 0],
              }),
              transform: [
                {
                  scale: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1.4],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

interface ScanLineProps {
  width: number;
}

export const ScanLine: React.FC<ScanLineProps> = ({ width }) => {
  const position = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(position, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(position, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.scanLine,
        {
          width,
          transform: [
            {
              translateY: position.interpolate({
                inputRange: [0, 1],
                outputRange: [-width / 2, width / 2],
              }),
            },
          ],
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center" },
  ring: { position: "absolute", borderWidth: 1.5 },
  scanLine: {
    height: 2,
    backgroundColor: Colors.secondary,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    opacity: 0.9,
  },
});
