// components/admin-add/WhereToFindList.tsx
import styles from '@/components/admin-add/styles'
import editStyles from '@/components/edit/styles'
import { useStrings } from '@/providers/I18nProvider'
import { StoreRow } from '@/types/forms'
import React from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'

type Props = {
  rows: StoreRow[]
  setRows: (rows: StoreRow[]) => void
}

// Hjälpare: format/parse
const formatPriceForInput = (n: number): string => {
  // Visa tomt fält om värdet inte är ett giltigt tal (t.ex. NaN)
  return Number.isFinite(n) ? String(n) : ''
}

const parsePriceFromInput = (s: string): number => {
  // Tillåt kommatecken, rensa bort annat skräp
  const cleaned = s.replace(',', '.').replace(/[^\d.-]/g, '')
  const v = parseFloat(cleaned)
  return Number.isFinite(v) ? v : Number.NaN
}

export default function WhereToFindList({ rows, setRows }: Props) {
  const { t } = useStrings()

  const updateName = (idx: number, name: string) => {
    const next = [...rows]
    // skapa ny rad-objekt för att undvika mutation-buggar
    next[idx] = { ...next[idx], name }
    setRows(next)
  }

  const updatePrice = (idx: number, text: string) => {
    const next = [...rows]
    next[idx] = { ...next[idx], price: parsePriceFromInput(text) }
    setRows(next)
  }

  const removeRow = (idx: number) => {
    setRows(rows.filter((_, i) => i !== idx))
  }

  const addRow = () => {
    setRows([...rows, { name: '', price: Number.NaN }])
  }

  return (
    <View style={styles.list}>
      {rows.map((row, idx) => (
        <View key={idx} style={styles.row}>
          <TextInput
            value={row.name}
            onChangeText={t => updateName(idx, t)}
            placeholder={t.admin_add.store}
            style={[editStyles.textInput, { flex: 1 }]}
          />
          <TextInput
            value={formatPriceForInput(row.price)}
            onChangeText={t => updatePrice(idx, t)}
            placeholder={t.admin_add.price}
            keyboardType="decimal-pad"
            style={[editStyles.textInput, { width: 120 }]}
          />
          <Pressable onPress={() => removeRow(idx)} hitSlop={8} style={styles.removeButton}>
            <Text style={styles.removeButtonText}>{t.admin_add.remove}</Text>
          </Pressable>
        </View>
      ))}
      <Pressable onPress={addRow} style={styles.addRow}>
        <Text style={styles.addRowText}>{t.admin_add.add_row}</Text>
      </Pressable>
    </View>
  )
}
