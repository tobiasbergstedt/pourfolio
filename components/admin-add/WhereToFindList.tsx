// components/admin-add/WhereToFindList.tsx
import styles from '@/components/admin-add/styles'
import editStyles from '@/components/edit/styles'
import { StoreRow } from '@/hooks/useAdminEditForm'
import { useStrings } from '@/providers/I18nProvider'
import React from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'

type Props = {
  rows: StoreRow[]
  setRows: (rows: StoreRow[]) => void
}

export default function WhereToFindList({ rows, setRows }: Props) {
  const { t } = useStrings()

  return (
    <View style={styles.list}>
      {rows.map((row, idx) => (
        <View key={idx} style={styles.row}>
          <TextInput
            value={row.name}
            onChangeText={t => {
              const next = [...rows]
              next[idx].name = t
              setRows(next)
            }}
            placeholder={t.admin_add.store}
            style={[editStyles.textInput, { flex: 1 }]}
          />
          <TextInput
            value={row.price}
            onChangeText={t => {
              const next = [...rows]
              next[idx].price = t
              setRows(next)
            }}
            placeholder={t.admin_add.price}
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
      <Pressable onPress={() => setRows([...rows, { name: '', price: '' }])} style={styles.addRow}>
        <Text style={styles.addRowText}>{t.admin_add.add_row}</Text>
      </Pressable>
    </View>
  )
}
