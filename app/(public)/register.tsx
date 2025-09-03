import Colors from '@/assets/colors'
import CopyrightFooter from '@/components/CoprightFooter'
import IconTextInput from '@/components/IconTextInput'
import MasterButton from '@/components/MasterButton'
import ScreenContainer from '@/components/ScreenContainer'
import { auth, db } from '@/lib/firebase'
import { useStrings } from '@/providers/I18nProvider'
import { useRouter } from 'expo-router'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { useState } from 'react'
import { Alert, Image, StyleSheet, Text, View } from 'react-native'

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const router = useRouter()
  const { t } = useStrings()

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return Alert.alert(t.login.missing_fields)
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return Alert.alert(t.general.error, t.register.enter_valid_email)
    }

    if (password !== confirmPassword) {
      return Alert.alert(t.general.error, t.register.password_no_match)
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password)
      const uid = userCredential.user.uid

      await setDoc(doc(db, 'users', uid), {
        first_name: firstName,
        last_name: lastName,
        isAdmin: false,
      })

      Alert.alert(t.general.success, t.register.completed)
      router.replace('/')
    } catch (err) {
      Alert.alert(t.login.registration_error, (err as Error).message)
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
        <Text style={styles.title}>{t.login.register}</Text>

        <IconTextInput
          icon="user"
          placeholder={t.general.first_name}
          value={firstName}
          onChangeText={setFirstName}
        />
        <IconTextInput
          icon="user"
          placeholder={t.general.last_name}
          value={lastName}
          onChangeText={setLastName}
        />
        <IconTextInput
          icon="envelope"
          placeholder={t.login.email}
          value={email}
          onChangeText={setEmail}
        />
        <IconTextInput
          icon="lock"
          placeholder={t.login.password}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <IconTextInput
          icon="lock"
          placeholder={t.register.confirm}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <View style={{ height: 20 }} />
        <MasterButton
          title={t.login.register}
          onPress={handleRegister}
          disabled={!firstName || !lastName || !email || !password || !confirmPassword}
        />
        <CopyrightFooter />
      </View>
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 32,
    justifyContent: 'center',
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: Colors.black,
  },
})
