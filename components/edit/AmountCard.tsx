import InfoCard from '@/components/InfoCard'
import MasterButton from '@/components/MasterButton'
import styles from '@/components/edit/styles'
import React, { useCallback } from 'react'
import { TextInput, View } from 'react-native'

type Props = {
  label: string
  value: string
  onChange: (next: string) => void
  min?: number
  step?: number
}

export default function AmountCard({ label, value, onChange, min = 0, step = 1 }: Props) {
  const parse = (v: string) => {
    const n = parseInt(v, 10)
    return Number.isFinite(n) ? n : 0
  }

  const clamp = (n: number) => Math.max(min, n)

  const dec = useCallback(() => {
    const next = clamp(parse(value) - step)
    onChange(String(next))
  }, [value, onChange, step, min])

  const inc = useCallback(() => {
    const next = clamp(parse(value) + step)
    onChange(String(next))
  }, [value, onChange, step, min])

  const onChangeText = useCallback(
    (t: string) => {
      if (t === '') return onChange('')
      const next = clamp(parse(t))
      onChange(String(next))
    },
    [onChange, min]
  )

  return (
    <InfoCard label={label}>
      <View style={styles.quantityRow}>
        <MasterButton title="–" onPress={dec} variant="primary" style={styles.qtyButton} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
          style={styles.quantityInput}
        />
        <MasterButton title="+" onPress={inc} variant="primary" style={styles.qtyButton} />
      </View>
    </InfoCard>
  )
}
