import Colors from '@/assets/colors'
import Styles from '@/assets/styles'
import styles from '@/components/edit/styles'
import AutoShrinkText from '@/components/ui/AutoShrinkText'
import DonutGauge from '@/components/ui/DonutGauge'
import { PropertyRow } from '@/types/forms'
import { translatePropertyName } from '@/utils/i18n'
import { getPropertyIconName } from '@/utils/icons'
import { FontAwesome5 } from '@expo/vector-icons'
import React from 'react'
import { Text, View } from 'react-native'
import InfoCard from '../InfoCard'

type Props = {
  label: string
  properties?: PropertyRow[] | null
  showScale?: boolean // valfritt: visa 0–10 skala
  max?: number // default 10
}

export default function PropertiesCard({ label, properties, showScale = true, max = 10 }: Props) {
  if (!properties || properties.length === 0) return null

  return (
    <InfoCard label="">
      <View style={styles.propertyList}>
        {properties.map((p, idx) => {
          const iconName = getPropertyIconName(p.name)
          const displayName = translatePropertyName(p.name, { prettifyFallback: true })
          const clamped = Number.isFinite(p.value) ? Math.max(0, Math.min(max, p.value)) : 0

          return (
            <View key={`${p.name}-${idx}`} style={styles.propertyItem}>
              <View style={styles.propertyLeft}>
                <FontAwesome5
                  name={iconName}
                  size={Styles.iconSizeMain}
                  style={styles.propertyIcon}
                />
                <AutoShrinkText
                  style={styles.propertyName}
                  numberOfLines={1}
                  minimumFontScale={0.6}
                >
                  {displayName}
                </AutoShrinkText>
              </View>

              <DonutGauge
                value={clamped}
                max={max}
                size={64}
                thickness={10}
                fillColor={Colors.primary} // lila
                trackColor={Colors.superLightGray}
              >
                <Text style={styles.propertyValueCenterText}>{clamped}/10</Text>
              </DonutGauge>
            </View>
          )
        })}
      </View>
    </InfoCard>
  )
}
