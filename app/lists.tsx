// app/lists.tsx
import Colors from '@/assets/colors'
import Styles from '@/assets/styles'
import InfoCard from '@/components/InfoCard'
import styles from '@/components/lists/styles'
import MasterButton from '@/components/MasterButton'
import ScreenContainer from '@/components/ScreenContainer'
import { useStrings } from '@/providers/I18nProvider'
import { useCurrentList } from '@/providers/ListProvider'
import { useToast } from '@/providers/ToastProvider'
import { createList, deleteListCompletely, leaveList } from '@/services/lists'
import { FontAwesome5 } from '@expo/vector-icons'
import { useFocusEffect } from 'expo-router'
import React, { useCallback, useMemo, useState } from 'react'
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native'

export default function ListsScreen() {
  const { lists, selectedListId, setSelectedListId, ensurePersonalList } = useCurrentList()
  const [newName, setNewName] = useState('')
  const { t, fmt } = useStrings()

  // Delete-modal state
  const [delOpen, setDelOpen] = useState(false)
  const [targetId, setTargetId] = useState<string | null>(null)
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)

  const toast = useToast()

  // —— Sortering: 'Min lista' först, därefter alfabetiskt ——
  const sortedLists = useMemo(() => {
    const isPersonalByName = (name?: string | null) =>
      (name ?? '').trim().toLowerCase() === 'min lista'

    return [...lists].sort((a, b) => {
      const aPersonal = a.isPersonal === true || isPersonalByName(a.name)
      const bPersonal = b.isPersonal === true || isPersonalByName(b.name)
      if (aPersonal !== bPersonal) return aPersonal ? -1 : 1

      const aName = a.name ?? a.id
      const bName = b.name ?? b.id
      // Svensk sortering, case-insensitive
      return aName.localeCompare(bName, 'sv', { sensitivity: 'base' })
    })
  }, [lists])

  const target = useMemo(() => sortedLists.find(l => l.id === targetId), [sortedLists, targetId])
  const isOnlyList = sortedLists.length <= 1

  const askDelete = (id: string) => {
    const l = sortedLists.find(x => x.id === id)
    if (!l) return
    if (l.isPersonal) {
      Alert.alert(t.lists.cannot_remove, t.lists.cannot_remove_personal)
      return
    }
    if (isOnlyList) {
      Alert.alert(t.lists.cannot_remove, t.lists.cannot_remove_only)
      return
    }
    if (l.role !== 'owner') {
      Alert.alert(t.lists.cannot_remove, t.lists.cannot_remove_not_owner)
      return
    }
    setTargetId(id)
    setConfirm('')
    setDelOpen(true)
  }

  const doDelete = async () => {
    if (!target) return
    const targetName = (target.name ?? '').trim().toLowerCase()
    if (!targetName || confirm.trim().toLowerCase() !== targetName) {
      Alert.alert(t.lists.wrong_confirmation, t.lists.wrong_confirmation_explanation)
      return
    }

    setBusy(true)
    try {
      if (target.id === selectedListId) {
        const fallbackId = await ensurePersonalList()
        await setSelectedListId(fallbackId)
      }
      setDelOpen(false)
      await deleteListCompletely(target.id)
      toast.show(fmt(t.lists.remove_success, { name: target.name }), 'success')
      setTargetId(null)
      setConfirm('')
    } catch (e: any) {
      setDelOpen(true)
      Alert.alert(t.lists.error, e?.message ?? String(e))
    } finally {
      setBusy(false)
    }
  }

  const leaveCandidates = useMemo(
    () => sortedLists.filter(l => l.id !== selectedListId && l.role !== 'owner'),
    [sortedLists, selectedListId]
  )

  useFocusEffect(
    useCallback(() => {
      // return-funktionen körs på BLUR (när du lämnar skärmen)
      return () => {
        setNewName('')
        setConfirm('')
        setDelOpen(false)
        setTargetId(null)
        setBusy(false)
      }
    }, [])
  )

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.listsContainer} keyboardShouldPersistTaps="handled">
        <InfoCard label={t.lists.lists_header}>
          <View style={styles.listsGap}>
            {sortedLists.length === 0 ? (
              <Text style={{ color: Colors.mediumGray }}>{t.lists.no_lists}</Text>
            ) : (
              sortedLists.map(item => (
                <View
                  key={item.id}
                  style={[
                    styles.listsListItem,
                    {
                      borderColor:
                        item.id === selectedListId ? Colors.primary : Colors.superDuperLightGray,
                    },
                  ]}
                >
                  <Pressable
                    onPress={() => setSelectedListId(item.id)}
                    style={styles.listsListItemPressable}
                  >
                    <Text style={styles.listsListItemText}>
                      {item.name === 'Min lista' ? t.lists.my_list : (item.name ?? item.id)}
                    </Text>
                    {item.role === 'owner' && !item.isPersonal && (
                      <FontAwesome5
                        name="trash"
                        size={Styles.iconSizeSmall}
                        color={Colors.primary}
                        onPress={() => askDelete(item.id)}
                      />
                    )}
                  </Pressable>
                </View>
              ))
            )}
          </View>
        </InfoCard>

        <InfoCard label={t.lists.create_new_list}>
          <View style={styles.listsGap}>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder={t.lists.name_of_list}
              style={styles.listsTextInput}
            />
            <MasterButton
              title={t.lists.create}
              variant="primary"
              disabled={newName.trim().length === 0}
              onPress={async () => {
                const name = newName.trim()
                if (!name) return
                try {
                  const id = await createList(name)
                  await setSelectedListId(id)
                  setNewName('')
                  toast.show(fmt(t.lists.created, { name }), 'success')
                } catch (e: any) {
                  console.error('[lists] createList failed:', e)
                  Alert.alert(t.lists.error, e?.message ?? String(e))
                }
              }}
            />
          </View>
        </InfoCard>

        <InfoCard label={t.lists.leave_list}>
          <View style={styles.listsGap}>
            {leaveCandidates.length === 0 ? (
              <Text style={styles.listsLeaveText}>{t.lists.no_lists_to_leave}</Text>
            ) : (
              leaveCandidates.map(item => (
                <MasterButton
                  key={item.id}
                  title={fmt(t.lists.leave, { name: item.name ?? item.id })}
                  variant="secondary"
                  onPress={async () => {
                    Alert.alert(
                      t.lists.leave_list_alert_header,
                      fmt(t.lists.leave_alert_question, { name: item.name ?? item.id }),
                      [
                        { text: t.general.cancel, style: 'cancel' },
                        {
                          text: t.lists.leave,
                          style: 'destructive',
                          onPress: async () => {
                            try {
                              if (item.id === selectedListId) {
                                const fallbackId = await ensurePersonalList()
                                await setSelectedListId(fallbackId)
                              }
                              await leaveList(item.id)
                              toast.show(
                                fmt(t.lists.leave_confirmation, { name: item.name ?? item.id }),
                                'info'
                              )
                            } catch (e: any) {
                              Alert.alert(t.lists.error, e?.message ?? String(e))
                            }
                          },
                        },
                      ]
                    )
                  }}
                />
              ))
            )}
          </View>
        </InfoCard>
      </ScrollView>

      {/* Delete-modal med namn-bekräftelse */}
      <Modal
        visible={delOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDelOpen(false)}
      >
        <Pressable style={styles.listsModalBackdrop} onPress={() => !busy && setDelOpen(false)}>
          <Pressable style={styles.listsModalContent}>
            <Text style={styles.listsModalTextHeader}>{t.lists.remove_list}</Text>
            <Text style={styles.listsModalText}>
              {t.lists.enter_name_part_one}
              <Text style={styles.listsModalTarget}>{target?.name ?? ''}</Text>
              {t.lists.enter_name_part_two}
            </Text>
            <TextInput
              value={confirm}
              onChangeText={setConfirm}
              placeholder={t.lists.name_of_list_placeholder}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.listsTextInput}
              editable={!busy}
            />
            <View style={styles.listsModalButtons}>
              <MasterButton
                title={t.general.cancel}
                variant="secondary"
                onPress={() => setDelOpen(false)}
                size="auto"
                style={styles.listsModalButton}
              />
              <MasterButton
                title={busy ? t.lists.removing : t.lists.remove}
                variant="primary"
                onPress={doDelete}
                disabled={
                  busy ||
                  !target ||
                  !confirm.trim() ||
                  (target?.name ?? '').trim().length === 0 ||
                  confirm.trim().toLowerCase() !== (target?.name ?? '').trim().toLowerCase()
                }
                size="auto"
                style={styles.listsModalButton}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenContainer>
  )
}
