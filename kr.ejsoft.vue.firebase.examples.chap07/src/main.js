import Vue from 'vue';
import firebase from 'firebase';
import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify';

Vue.config.productionTip = false;

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VUE_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_FIREBASE_APP_ID
};


// Initialize Firebase
firebase.initializeApp(firebaseConfig);

if(window.location.hostname === 'localhost') {
  firebase.firestore().settings({ host: 'localhost:8080', ssl: false });
  firebase.functions().useFunctionsEmulator('http://localhost:5001');
}

new Vue({
  router,
  vuetify,
  render: h => h(App),
}).$mount('#app');
