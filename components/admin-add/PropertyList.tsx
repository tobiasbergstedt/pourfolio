// components/admin-add/PropertyList.tsx
import styles from '@/components/admin-add/styles'
import editStyles from '@/components/edit/styles'
import { useStrings } from '@/providers/I18nProvider'
import { PropertyRow } from '@/types/forms'
import React from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'

type Props = {
  rows: PropertyRow[]
  setRows: React.Dispatch<React.SetStateAction<PropertyRow[]>>
}

export default function PropertyList({ rows, setRows }: Props) {
  const { t } = useStrings()

  const toText = (n: number | null) => (Number.isFinite(n) ? String(n) : '')
  const toNum = (s: string) => {
    const trimmed = s.trim()
    if (!trimmed) return Number.NaN
    const n = parseFloat(trimmed.replace(',', '.'))
    return Number.isFinite(n) ? n : Number.NaN
  }

  return (
    <View style={styles.list}>
      {rows.map((row, idx) => (
        <View key={idx} style={styles.row}>
          <TextInput
            value={row.name}
            onChangeText={t => {
              setRows(prev => {
                const next = [...prev]
                next[idx] = { ...next[idx], name: t }
                return next
              })
            }}
            placeholder={t.admin_add.name}
            style={[editStyles.textInput, { flex: 1 }]}
          />
          <TextInput
            value={toText(row.value)}
            onChangeText={t => {
              setRows(prev => {
                const next = [...prev]
                next[idx] = { ...next[idx], value: toNum(t) }
                return next
              })
            }}
            placeholder={t.admin_add.value}
            keyboardType="decimal-pad"
            style={[editStyles.textInput, { width: 120 }]}
          />
          <Pressable
            onPress={() => setRows(rows.filter((_, i) => i !== idx))}
            hitSlop={8}
            style={styles.removeButton}
          >
            <Text style={styles.removeButtonText}>{t.admin_add.remove}</Text>
          </Pressable>
        </View>
      ))}
      <Pressable
        onPress={() => setRows(prev => [...prev, { name: '', value: Number.NaN }])}
        style={styles.addRow}
      >
        <Text style={styles.addRowText}>{t.admin_add.add_row}</Text>
      </Pressable>
    </View>
  )
}
