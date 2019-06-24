// firebase.js
import * as firebase from 'firebase';

firebase.initializeApp({
  apiKey:'AIzaSyBrRUik9iFzSFGvIO_LVzfnXjpyTcjmBb4',
  authDomain: 'libero-demo.firebaseapp.com',
  databaseURL: 'https://libero-demo.firebaseio.com/',
  projectId: 'libero-demo',
  storageBucket: 'gs://libero-demo.appspot.com',
  messagingSenderId: '548811556963'
});

export default firebase;
