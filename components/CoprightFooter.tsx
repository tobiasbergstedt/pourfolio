import sharedStyles from '@/components/shared/styles'
import { useStrings } from '@/providers/I18nProvider'
import { Text } from 'react-native'

export default function CopyrightFooter() {
  const { t } = useStrings()

  return (
    <Text style={sharedStyles.copyRightFooter}>
      {t.general.app_name} {t.general.copyright}
    </Text>
  )
}
