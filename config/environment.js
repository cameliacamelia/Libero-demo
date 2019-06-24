//environment.js
var environments = {
  staging: {
    FIREBASE_API_KEY: 'AIzaSyBrRUik9iFzSFGvIO_LVzfnXjpyTcjmBb4',
    FIREBASE_AUTH_DOMAIN: 'libero-demo.firebaseapp.com',
    FIREBASE_DATABASE_URL: 'https://libero-demo.firebaseio.com/',
    FIREBASE_PROJECT_ID: 'libero-demo',
    FIREBASE_STORAGE_BUCKET: 'gs://libero-demo.appspot.com',
    FIREBASE_MESSAGING_SENDER_ID: '548811556963',
    GOOGLE_CLOUD_VISION_API_KEY: 'AIzaSyBh2McIvgg_KU48T7ev9LjAOBN6775xisc'
  },
  production: {
    // Warning: This file still gets included in your native binary and is not a secure way to store secrets if you build for the app stores. Details: https://github.com/expo/expo/issues/83
  }
};

function getReleaseChannel() {
  let releaseChannel = Expo.Constants.manifest.releaseChannel;
  if (releaseChannel === undefined) {
    return 'staging';
  } else if (releaseChannel === 'staging') {
    return 'staging';
  } else {
    return 'staging';
  }
}
function getEnvironment(env) {
  console.log('Release Channel: ', getReleaseChannel());
  return environments[env];
}
var Environment = getEnvironment(getReleaseChannel());
export default Environment;