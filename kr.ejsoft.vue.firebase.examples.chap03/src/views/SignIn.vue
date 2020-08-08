<template>
  <v-container
    class="fill-height"
    fluid
  >
    <v-row
      align="center"
      justify="center"
    >
      <v-col
        cols="12"
        sm="8"
        md="4"
      >
        <v-card class="elevation-12">
          <v-toolbar
            color="primary"
            dark
            flat
          >
            <v-toolbar-title>SignIn</v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>
          <v-card-text>
            <v-form>
              <v-text-field
                label="Login"
                name="login"
                prepend-icon="mdi-account"
                type="text"
                v-model="email"
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn color="secondary" @click="$router.push('/signup')">SignUp</v-btn>
            <!-- <router-link to="/signup">SignUp</router-link> -->
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="signin">SignIn</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>


<script>
import firebase from 'firebase'

export default {
  data: () => ({
      email : "",
      isSignin: false,
  }),
  created () {
    var user = firebase.auth().currentUser;
    console.log(user);

    // firebase.auth().onAuthStateChanged(function(user) {
    //   if (user) {
    //     // User is signed in.
    //     console.log(user);
    //   } else {
    //     // No user is signed in.
    //   }
    // });
    if(user) {
      this.isSignin = true;
    }
  },
  methods: {
    signin() {
      console.log('SignIn', this.email);

      if(!this.email) {
        alert('전자우편을 입력하여 주십시오.');
        return;
      }
      
      const protocol = location.protocol;
      const hostName = location.hostname;
      const port = location.port;

      let url = protocol + '//' + hostName + (port ? ':' + port : '');
      // url += '/#/signupfinish';
      url += '/callback/email';

      console.log(url);
      const actionCodeSettings = {
        // URL you want to redirect back to. The domain (www.example.com) for this
        // URL must be whitelisted in the Firebase Console.
        // url: 'https://www.example.com/finishSignUp?cartId=1234',
        url: url,
        // This must be true.
        handleCodeInApp: true,
        // iOS: {
        //   bundleId: 'com.example.ios'
        // },
        // android: {
        //   packageName: 'com.example.android',
        //   installApp: true,
        //   minimumVersion: '12',
        // },
        // dynamicLinkDomain: 'example.page.link',
      };

      const _this = this;
      firebase.auth().sendSignInLinkToEmail(this.email, actionCodeSettings)
      .then(function() {
        // The link was successfully sent. Inform the user.
        // Save the email locally so you don't need to ask the user for it again
        // if they open the link on the same device.
        window.localStorage.setItem('emailForSignIn', _this.email);
        alert("입력하신 전자우편으로 인증메일을 발송하였습니다. 전자우편을 통해서 로그인을 완료하시기 바랍니다.");
        _this.email = '';
      })
      .catch(function(error) {
        // Some error occurred, you can inspect the code: error.code
        console.log(error)
        // if(error.code === "auth/invalid-email") {}
        if(error && error.message) {
          alert(error.message);
        }
      });
    },
    signout() {
      firebase.auth().signOut().then(function() {
        // Sign-out successful.
      }).catch(function(error) {
        // An error happened.
        console.log(error);
      });
    }
  }
}
</script>