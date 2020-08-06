import Vue from 'vue'
import App from './App.vue'
import router from './router'
import firebase from 'firebase'
import vuetify from './plugins/vuetify'

Vue.config.productionTip = false

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: 'AIzaSyA8krNx338j3OjeuuTMWX7sfQ_zJ94hsgM',
  authDomain: '<project-code>.firebaseapp.com',
  databaseURL: 'https://<project-code>.firebaseio.com',
  projectId: '<project-code>',
  storageBucket: '<project-code>.appspot.com',
  messagingSenderId: '59758297871',
  appId: '1:59758297871:web:a1263dda097b646dd2347a'
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig)

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
