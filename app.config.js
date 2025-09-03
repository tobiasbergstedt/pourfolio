import 'dotenv/config'

export default {
  expo: {
    name: 'pourfolio',
    slug: 'pourfolio',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'pourfolio',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSPhotoLibraryUsageDescription: 'We need access to choose a photo for the drink.',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      package: 'com.tobiasbergstedt.pourfolio',
      windowSoftInputMode: 'adjustResize',
      softwareKeyboardLayoutMode: 'resize',
      permissions: ['READ_MEDIA_IMAGES'],
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/pourfolio_splash.png',
          imageWidth: 200,
          resizeMode: 'cover',
          backgroundColor: '#1D2C51',
        },
      ],
      [
        'expo-font',
        {
          fonts: ['./assets/fonts/SpaceMono-Regular.ttf'],
        },
      ],
      ['expo-image-picker'],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: 'e8461e4e-e56d-4cf4-8fd5-9cae3c762d72',
      },

      // 💡 Miljövariabler från .env
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
      FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
      FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
      FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID,
    },
  },
}
