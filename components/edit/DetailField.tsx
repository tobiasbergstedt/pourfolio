import Styles from '@/assets/styles'
import InfoCard from '@/components/InfoCard'
import styles from '@/components/edit/styles'
import { useStrings } from '@/providers/I18nProvider'
import { ShopItem } from '@/types/types'
import React, { useEffect, useState } from 'react'
import { Text, TextInput, TextInputProps, View } from 'react-native'

type Props = {
  label: string
  value?: string | ShopItem[] | null
  /** Om true → rendera ett TextInput i stället för statisk text (gäller bara strängvärden). */
  editable?: boolean
  /** Callback för kontroll av textvärdet (kontrollerad komponent). */
  onChangeText?: (text: string) => void
  /** Placeholder för input. */
  placeholder?: string
  /** TextInput-props (valfritt) – t.ex. multiline, keyboardType, maxLength, autoFocus etc. */
  inputProps?: Omit<TextInputProps, 'value' | 'onChangeText' | 'placeholder' | 'style'>
}

export default function DetailField({
  label,
  value,
  editable = false,
  onChangeText,
  placeholder,
  inputProps,
}: Props) {
  const [internal, setInternal] = useState(typeof value === 'string' ? value : '')
  const { t } = useStrings()

  useEffect(() => {
    if (typeof value === 'string') setInternal(value)
  }, [value])

  // 1) Sträng: TextInput (editable) eller statisk text (read-only)
  if (typeof value === 'string' || editable) {
    const text = typeof value === 'string' ? value : internal

    if (!editable && (!text || text.trim() === '')) return null

    if (editable) {
      const handleChange = (t: string) => {
        setInternal(t)
        onChangeText?.(t)
      }
      return (
        <InfoCard label={label}>
          <TextInput
            value={onChangeText ? (typeof value === 'string' ? value : internal) : internal}
            onChangeText={handleChange}
            placeholder={placeholder}
            style={[styles.textInput]}
            {...inputProps}
          />
        </InfoCard>
      )
    }

    return (
      <InfoCard label={label}>
        <Text style={styles.staticField}>{text || '—'}</Text>
      </InfoCard>
    )
  }

  // 2) Array: rendera lista {name, price}
  if (Array.isArray(value) && value.length > 0) {
    return (
      <InfoCard label={label}>
        <View style={{ gap: Styles.gapMain }}>
          {value.map((item, idx) => (
            <Text key={idx} style={styles.staticField}>
              {item.name}: {item.price.toLocaleString(t.general.locale)} {t.general.sek}
            </Text>
          ))}
        </View>
      </InfoCard>
    )
  }

  // 3) Null/undefined/tom array → rendera inget
  return null
}
