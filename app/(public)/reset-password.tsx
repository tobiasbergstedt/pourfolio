import Colors from '@/assets/colors'
import CopyrightFooter from '@/components/CoprightFooter'
import IconTextInput from '@/components/IconTextInput'
import MasterButton from '@/components/MasterButton'
import ScreenContainer from '@/components/ScreenContainer'
import { auth } from '@/lib/firebase'
import { useStrings } from '@/providers/I18nProvider'
import { useRouter } from 'expo-router'
import { sendPasswordResetEmail } from 'firebase/auth'
import { useState } from 'react'
import { Alert, Image, StyleSheet, Text, View } from 'react-native'

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState('')
  const router = useRouter()
  const { t } = useStrings()

  const handleReset = async () => {
    if (!email) return Alert.alert(t.general.error, t.login.enter_email)

    try {
      await sendPasswordResetEmail(auth, email)
      Alert.alert(t.general.success, t.login.email_sent)
      router.back()
    } catch (err) {
      Alert.alert(t.general.error, (err as Error).message)
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>{t.login.reset_password}</Text>
        <IconTextInput
          icon="envelope"
          placeholder={t.login.email}
          value={email}
          onChangeText={setEmail}
        />
        <View style={{ height: 20 }} />
        <MasterButton title={t.login.send_reset_mail} onPress={handleReset} disabled={!email} />
        <CopyrightFooter />
      </View>
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: Colors.background,
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 40,
    borderRadius: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: Colors.superLightGray,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    color: Colors.black,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
})
