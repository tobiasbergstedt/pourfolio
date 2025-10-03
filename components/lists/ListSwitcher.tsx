// components/lists/ListSwitcher.tsx
import Colors from '@/assets/colors'
import styles from '@/components/lists/styles'
import MasterButton from '@/components/MasterButton'
import { useStrings } from '@/providers/I18nProvider'
import { useCurrentList } from '@/providers/ListProvider'
import React, { useMemo, useState } from 'react'
import { FlatList, Modal, Pressable, Text, View } from 'react-native'

export default function ListSwitcher() {
  const { lists, selectedListId, setSelectedListId, ensurePersonalList } = useCurrentList()
  const [open, setOpen] = useState(false)
  const { t, locale } = useStrings()

  const currentName = useMemo(() => {
    const found = lists.find(l => l.id === selectedListId)
    return found?.name === 'Min lista' ? t.lists.my_list : (found?.name ?? t.lists.no_list_selected)
  }, [lists, selectedListId, locale])

  return (
    <>
      <MasterButton
        title={currentName}
        variant="dropdown"
        onPress={() => setOpen(true)}
        icon={undefined}
      />
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.listSwitcherBackdrop} onPress={() => setOpen(false)}>
          <View style={styles.listSwitcherSheet}>
            <Text style={styles.listSwitcherTitle}>{t.lists.choose_list}</Text>
            <FlatList
              data={lists}
              keyExtractor={item => item.id}
              ItemSeparatorComponent={() => <View style={styles.listSwitcherSeparator} />}
              renderItem={({ item }) => (
                <Pressable
                  onPress={async () => {
                    await setSelectedListId(item.id)
                    setOpen(false)
                  }}
                  style={[
                    styles.listSwitcherRow,
                    item.id === selectedListId && { borderColor: Colors.primary },
                  ]}
                >
                  <Text style={styles.listSwitcherRowText}>
                    {item.name === 'Min lista' ? t.lists.my_list : (item.name ?? item.id)}
                  </Text>
                  <Text style={styles.listSwitcherRole}>{item.role}</Text>
                </Pressable>
              )}
              ListEmptyComponent={
                <Pressable
                  onPress={async () => {
                    const id = await ensurePersonalList()
                    await setSelectedListId(id)
                    setOpen(false)
                  }}
                  style={styles.listSwitcherRow}
                >
                  <Text style={styles.listSwitcherRowText}>{t.lists.create_personal}</Text>
                </Pressable>
              }
            />
          </View>
        </Pressable>
      </Modal>
    </>
  )
}
