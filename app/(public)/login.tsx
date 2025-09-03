import Colors from '@/assets/colors'
import ScreenContainer from '@/components/ScreenContainer'
import { Redirect, router } from 'expo-router'
import { onAuthStateChanged, signInWithEmailAndPassword, User } from 'firebase/auth'
import { useEffect, useRef, useState } from 'react'
import { Alert, Animated, Easing, StyleSheet, Text, View } from 'react-native'

import Styles from '@/assets/styles'
import CopyrightFooter from '@/components/CoprightFooter'
import IconTextInput from '@/components/IconTextInput'
import MasterButton from '@/components/MasterButton'
import { auth } from '@/lib/firebase'
import { useStrings } from '@/providers/I18nProvider'

export default function LoginScreen() {
  const { t } = useStrings()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState<User | null | undefined>(undefined)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser)
    return unsub
  }, [])

  // Om inloggad: deklarativ redirect, ingen imperativ replace (som ibland träffar 'index' för tidigt)
  if (user) return <Redirect href="/" />

  const handleNavigateToRegister = () => {
    router.push('/register')
  }

  const handleNavigateToResetPassword = () => {
    router.push('/reset-password')
  }

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert(t.login.missing_fields)
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      // Inget router.replace här – onAuthStateChanged sätter user => <Redirect />
    } catch (err) {
      Alert.alert(t.login.login_error, (err as Error).message)
    }
  }

  const scaleAnim = useRef(new Animated.Value(0.8)).current
  const opacityAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
    ]).start()
  }, [opacityAnim, scaleAnim])

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Animated.Image
            source={require('@/assets/images/logo.png')}
            style={[
              styles.logo,
              {
                transform: [{ scale: scaleAnim }],
                opacity: opacityAnim,
              },
            ]}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>
          {t.login.sign_in_heading} <Text style={styles.pourfolio}>{t.general.app_name}</Text>
        </Text>
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
        <MasterButton
          title={t.login.forgot}
          onPress={handleNavigateToResetPassword}
          variant="text"
        />
        <MasterButton
          title={t.login.sign_in}
          onPress={handleLogin}
          disabled={!email || !password}
        />

        <MasterButton
          title={t.login.register}
          onPress={handleNavigateToRegister}
          style={{ marginTop: Styles.marginPaddingSmall }}
        />
        <CopyrightFooter />
      </View>
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: Styles.marginPaddingMain,
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  logoContainer: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Styles.marginPaddingHuge,
  },
  logo: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    borderRadius: Styles.borderRadiusMain,
  },
  title: {
    fontSize: Styles.fontSizeTitle,
    fontWeight: 'bold',
    marginBottom: Styles.marginPaddingMain,
    textAlign: 'center',
    color: Colors.black,
  },
  pourfolio: {
    color: Colors.primary,
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: Colors.superLightGray,
    borderRadius: Styles.borderRadiusSmall,
    padding: Styles.marginPaddingSmall,
    fontSize: Styles.fontSizeMain,
    marginBottom: Styles.marginPaddingSmall,
    color: Colors.text,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: Styles.marginPaddingSmall,
    borderRadius: Styles.borderRadiusMain,
    alignItems: 'center',
    marginBottom: Styles.marginPaddingMini,
    outlineWidth: 0,
  },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: Styles.fontSizeButton },
})
