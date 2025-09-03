// components/ui/ZoomableImage.tsx
import uiStyles from '@/components/ui/styles'
import React from 'react'
import { Dimensions, StyleSheet } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  withTiming,
} from 'react-native-reanimated'

const { width, height } = Dimensions.get('window')

// Konstanter
const DOUBLE_TAP_ZOOM = 2
const MAX_ZOOM = 4
const MIN_ZOOM = 1

type Props = {
  uri: string
}

export default function ZoomableImage({ uri }: Props) {
  const scale = useSharedValue(1)
  const savedScale = useSharedValue(1)
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const savedTranslateX = useSharedValue(0)
  const savedTranslateY = useSharedValue(0)

  // Pinch zoom
  const pinch = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value
    })
    .onUpdate(e => {
      let newScale = savedScale.value * e.scale
      if (newScale > MAX_ZOOM) newScale = MAX_ZOOM
      if (newScale < MIN_ZOOM) newScale = MIN_ZOOM
      scale.value = newScale
    })
    .onEnd(() => {
      if (scale.value < MIN_ZOOM) {
        scale.value = withTiming(MIN_ZOOM)
        translateX.value = withTiming(0)
        translateY.value = withTiming(0)
      }
    })

  // Pan (dra)
  const pan = Gesture.Pan()
    .onStart(() => {
      savedTranslateX.value = translateX.value
      savedTranslateY.value = translateY.value
    })
    .onUpdate(e => {
      translateX.value = savedTranslateX.value + e.translationX
      translateY.value = savedTranslateY.value + e.translationY
    })
    .onEnd(e => {
      // Tröghet / inertieffekt vid släpp
      translateX.value = withDecay({
        velocity: e.velocityX,
        clamp: undefined, // kan begränsa om du vill
      })
      translateY.value = withDecay({
        velocity: e.velocityY,
        clamp: undefined,
      })
    })

  // Dubbeltryck zoom mot tryckpunkt
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(e => {
      if (scale.value > MIN_ZOOM) {
        // Återställ
        scale.value = withTiming(MIN_ZOOM)
        translateX.value = withTiming(0)
        translateY.value = withTiming(0)
      } else {
        // Zooma in mot tryckpunkten
        const tapX = e.x - width / 2
        const tapY = e.y - height / 2
        const targetScale = Math.min(DOUBLE_TAP_ZOOM, MAX_ZOOM)
        translateX.value = withTiming(-tapX * (targetScale - 1))
        translateY.value = withTiming(-tapY * (targetScale - 1))
        scale.value = withTiming(targetScale)
      }
    })

  // Gestkombination
  const composed = Gesture.Exclusive(doubleTap, Gesture.Simultaneous(pinch, pan))

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }))

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={uiStyles.zoomableImageContainer}>
        <Animated.Image
          source={{ uri }}
          style={[styles.image, animatedStyle]}
          resizeMode="contain"
        />
      </Animated.View>
    </GestureDetector>
  )
}

const styles = StyleSheet.create({
  image: {
    width,
    height,
  },
})
