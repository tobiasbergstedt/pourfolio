import styles from '@/components/ui/styles'
import React, { memo } from 'react'
import { View } from 'react-native'
import Svg, { Circle } from 'react-native-svg'

type Props = {
  value: number
  max?: number
  size?: number
  thickness?: number
  fillColor?: string // lila (värdet)
  trackColor?: string // ljusgrå bakgrundsring
  children?: React.ReactNode // t.ex. siffra i mitten
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n))
}

function DonutGauge({
  value,
  max = 10,
  size = 44,
  thickness = 6,
  fillColor = '#654FBC',
  trackColor = '#EEEEEE',
  children,
}: Props) {
  const v = Number.isFinite(value) ? clamp(value, 0, max) : 0
  const frac = v / max

  const r = (size - thickness) / 2
  const cx = size / 2
  const cy = size / 2
  const C = 2 * Math.PI * r
  const dash = C * frac
  const offset = C - dash

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Bakgrundsring */}
        <Circle cx={cx} cy={cy} r={r} stroke={trackColor} strokeWidth={thickness} fill="none" />
        {/* Värdering – start kl 12 via -90°-rotation */}
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={fillColor}
          strokeWidth={thickness}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${C} ${C}`}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </Svg>
      {children ? <View style={styles.donutGaugeCenter}>{children}</View> : null}
    </View>
  )
}

export default memo(DonutGauge)
