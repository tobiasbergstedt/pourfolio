import Colors from '@/assets/colors'
import styles from '@/components/navigation/styles'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import React from 'react'
import { Image, Pressable, Text, View } from 'react-native'

type Props = {
  goToProfile: () => void
  t: any
  user: { displayName?: string | null; email?: string | null; isAdmin?: boolean | null }
  avatarUrl?: string | null
}

export default function HeaderCard({ goToProfile, t, user, avatarUrl }: Props) {
  return (
    <Pressable
      onPress={goToProfile}
      accessibilityRole="button"
      accessibilityLabel={t.navigation.profile}
      style={({ pressed }) => [
        styles.appDrawerContentHeader,
        pressed && { backgroundColor: Colors.primaryPressed },
      ]}
      hitSlop={6}
    >
      {/* Edit-ikon uppe till höger */}
      <Pressable
        onPress={goToProfile}
        hitSlop={8}
        accessibilityLabel={t.general.edit}
        style={styles.appDrawerContentProfile}
      >
        <MaterialCommunityIcons name="lead-pencil" size={24} color={Colors.primary} />
      </Pressable>

      <View style={styles.appDrawerContentHeaderRow}>
        <View style={{ position: 'relative' }}>
          {avatarUrl ? (
            <Image
              key={avatarUrl}
              source={{ uri: avatarUrl }}
              style={styles.appDrawerContentAvatar}
            />
          ) : (
            <View style={[styles.appDrawerContentAvatar, styles.appDrawerContentAvatarFallback]}>
              <Text style={styles.appDrawerContentAvatarText}>
                {user.displayName?.[0]?.toUpperCase()}
              </Text>
            </View>
          )}
          {user.isAdmin && (
            <View style={styles.appDrawerContentAdminBadge}>
              <MaterialCommunityIcons name="shield-account" size={16} color={Colors.primary} />
            </View>
          )}
        </View>

        <View style={styles.appDrawerUserInfo}>
          <Text style={styles.appDrawerContentTitle}>{t.navigation.welcome}</Text>
          <Text style={styles.appDrawerContentName} numberOfLines={1}>
            {user.displayName}
          </Text>
          {user.isAdmin && (
            <Text style={styles.appDrawerContentAdmin} numberOfLines={1}>
              (Admin)
            </Text>
          )}
          {!!user.email && (
            <Text style={styles.appDrawerContentEmail} numberOfLines={1}>
              {user.email}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  )
}
