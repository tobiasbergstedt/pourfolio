import { FontAwesome5 } from '@expo/vector-icons'
import { ImageStyle, TextInputProps, TextStyle, ViewStyle } from 'react-native'

type Drink = {
  id: string
  name: string
  brand: string
  type: string // typens namn (efter resolve av ref)
  type_name: string
  quantity?: number
  image_label: string
  alcohol_percent?: number
  rating?: number
  country: string
  volume: number
  description: string
  pairing_suggestions: string
  drink_type?: any
  where_to_find?: any
  properties?: []
}

type DrinkType = {
  id: string
  name: string
  icon: string
}

type StatsOverviewProps = {
  drinks: Drink[]
}

type StyleOverrides = {
  cell?: ViewStyle
  cellActive?: ViewStyle
  icon?: ImageStyle
  iconFallback?: ViewStyle
  text?: TextStyle
}

type Placeholder = { id: string; __placeholder: true }

type GridItem = DrinkType | Placeholder

type IconTextInputProps = TextInputProps & {
  icon: React.ComponentProps<typeof FontAwesome5>['name']
}

type MasterButtonProps = {
  onPress: () => void
  title: string
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger' | 'text'
  size?: 'full' | 'auto'
  icon?: React.ReactNode
  inline?: boolean
  style?: ViewStyle
}

type SaveExtras = {
  user_notes?: string | null
}

export type {
  Drink,
  DrinkType,
  GridItem,
  IconTextInputProps,
  MasterButtonProps,
  Placeholder,
  SaveExtras,
  StatsOverviewProps,
  StyleOverrides,
}
