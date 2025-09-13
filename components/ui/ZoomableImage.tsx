// components/ui/ZoomableImage.tsx
import uiStyles from '@/components/ui/styles'
import React, { useEffect, useMemo, useState } from 'react'
import { Image as RNImage, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  withTiming,
} from 'react-native-reanimated'

const DOUBLE_TAP_ZOOM = 2
const MAX_ZOOM = 4
const MIN_ZOOM = 1

type Props = {
  uri: string
  /** Maxbredd/-höjd som du skickar från viewer (t.ex. 92% × 86% av fönster) */
  maxW: number
  maxH: number
}

export default function ZoomableImage({ uri, maxW, maxH }: Props) {
  const [imgW, setImgW] = useState(0)
  const [imgH, setImgH] = useState(0)

  // hämta naturliga bildmått
  useEffect(() => {
    let alive = true
    RNImage.getSize(
      uri,
      (w, h) => {
        if (alive) {
          setImgW(w)
          setImgH(h)
        }
      },
      () => {
        if (alive) {
          setImgW(1000)
          setImgH(1000)
        }
      }
    )
    return () => {
      alive = false
    }
  }, [uri])

  // contain-fit inom maxW/maxH
  const { fitW, fitH } = useMemo(() => {
    if (!maxW || !maxH || !imgW || !imgH) return { fitW: 0, fitH: 0 }
    const scale = Math.min(maxW / imgW, maxH / imgH)
    return {
      fitW: Math.max(1, Math.round(imgW * scale)),
      fitH: Math.max(1, Math.round(imgH * scale)),
    }
  }, [maxW, maxH, imgW, imgH])

  // ---- gester ----
  const scale = useSharedValue(1)
  const savedScale = useSharedValue(1)
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const savedTranslateX = useSharedValue(0)
  const savedTranslateY = useSharedValue(0)

  const pinch = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value
    })
    .onUpdate(e => {
      let s = savedScale.value * e.scale
      if (s > MAX_ZOOM) s = MAX_ZOOM
      if (s < MIN_ZOOM) s = MIN_ZOOM
      scale.value = s
    })
    .onEnd(() => {
      if (scale.value < MIN_ZOOM) {
        scale.value = withTiming(MIN_ZOOM)
        translateX.value = withTiming(0)
        translateY.value = withTiming(0)
      }
    })

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
      translateX.value = withDecay({ velocity: e.velocityX })
      translateY.value = withDecay({ velocity: e.velocityY })
    })

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(e => {
      if (!fitW || !fitH) return
      if (scale.value > MIN_ZOOM) {
        scale.value = withTiming(MIN_ZOOM)
        translateX.value = withTiming(0)
        translateY.value = withTiming(0)
      } else {
        // center relativt *bildens* initiala box
        const cx = fitW / 2
        const cy = fitH / 2
        const tapX = e.x - cx
        const tapY = e.y - cy
        const target = Math.min(DOUBLE_TAP_ZOOM, MAX_ZOOM)
        translateX.value = withTiming(-tapX * (target - 1))
        translateY.value = withTiming(-tapY * (target - 1))
        scale.value = withTiming(target)
      }
    })

  const composed = Gesture.Exclusive(doubleTap, Gesture.Simultaneous(pinch, pan))

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }))

  // Container ska inte tvingas fylla hela ytan; den krymper till bilden
  return (
    <GestureDetector gesture={composed}>
      <Animated.View
        style={[uiStyles.zoomableImageContainer, { width: fitW || 1, height: fitH || 1 }]}
        onStartShouldSetResponder={() => true}
      >
        {fitW > 0 && fitH > 0 ? (
          <Animated.Image
            source={{ uri }}
            resizeMode="contain"
            style={[{ width: fitW, height: fitH }, animatedStyle]}
          />
        ) : (
          <View style={{ width: 1, height: 1 }} />
        )}
      </Animated.View>
    </GestureDetector>
  )
}
