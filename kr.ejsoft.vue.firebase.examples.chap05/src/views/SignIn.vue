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
                v-model="email"
                type="text"
                label="Login"
                name="login"
                prepend-icon="mdi-account"
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="secondary"
              @click="$router.push('/signup')"
            >SignUp</v-btn>
            <!-- <router-link to="/signup">SignUp</router-link> -->
            <v-spacer />
            <v-btn
              v-if="!isSignin"
              color="primary"
              @click="signin"
            >SignIn</v-btn>
            <v-btn
              v-if="isSignin"
              color="primary"
              @click="signout"
            >SignOut</v-btn>
            <!--
            <v-spacer />
            <v-btn
              color="accent"
              @click="signout"
            >SignOut</v-btn>
            -->
          </v-card-actions>

          <v-card-text
            align="center"
            class="py-2"
          >
            <v-btn
              @click="google"
              color="transparent"
              depressed
              icon
            >
              <v-img :src="require('../assets/login.google.png')" />
            </v-btn>
          </v-card-text>

          <v-card-text
            align="center"
            class="py-2"
          >
            <v-btn
              @click="facebook"
              color="transparent"
              depressed
              icon
            >
              <v-img :src="require('../assets/login.facebook.png')" />
            </v-btn>
          </v-card-text>

<!--
          <v-card-text
            align="center"
            class="py-2"
          >
            <v-btn
              @click="kakao"
              color="transparent"
              depressed
              icon
            >
              <v-img :src="require('../assets/login.kakao.png')" />
            </v-btn>
          </v-card-text>

          <v-card-text
            align="center"
            class="py-2"
          >
            <v-btn
              @click="naver"
              color="transparent"
              depressed
              icon
            >
              <v-img :src="require('../assets/login.naver.png')" />
            </v-btn>
          </v-card-text>

          <v-card-text
            align="center"
            class="pt-2"
          >
            <v-btn
              @click="twitter"
              color="transparent"
              depressed
              icon
            >
              <v-img :src="require('../assets/login.twitter.png')" />
            </v-btn>
          </v-card-text>
          -->
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
      const _this = this;
      firebase.auth().signOut().then(function() {
        // Sign-out successful.
        _this.isSignin = false;
        //_this.$router.push("/signin");
      }).catch(function(error) {
        // An error happened.
        console.log(error);
      });
    },
    google() {
      const _this = this;

      var provider = new firebase.auth.GoogleAuthProvider();

      // 추가적인 권한이 있을 경우에는 아래와 같이 추가합니다.
      // provider.addScope('https://www.googleapis.com/auth/contacts.readonly');

      // 로그인시 보여줄 언어를 지정합니다.
      // firebase.auth().languageCode = 'pt';
      // To apply the default browser preference instead of explicitly setting it.
      // firebase.auth().useDeviceLanguage();

      // 로그인 아이디의 기본값을 지정합니다. 지정하지 않아도 됩니다.
      provider.setCustomParameters({
        'login_hint': 'user@example.com'
      });

      // 로그인 팝업창을 띄웁니다.
      firebase.auth().signInWithPopup(provider).then(function(result) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        // ...
        console.log(user);
        _this.isSignin = true;
        _this.$router.push("/profile");
      }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
      });

      // firebase.auth().getRedirectResult().then(function(result) {
      //   if (result.credential) {
      //     // This gives you a Google Access Token. You can use it to access the Google API.
      //     var token = result.credential.accessToken;
      //     // ...
      //   }
      //   // The signed-in user info.
      //   var user = result.user;
      //   console.log(user);
      //   _this.$router.push("/profile");
      // }).catch(function(error) {
      //   // Handle Errors here.
      //   var errorCode = error.code;
      //   var errorMessage = error.message;
      //   // The email of the user's account used.
      //   var email = error.email;
      //   // The firebase.auth.AuthCredential type that was used.
      //   var credential = error.credential;
      //   // ...
      // });
      // firebase.auth().signInWithRedirect(provider);
    },
    facebook() {
      const _this = this;
      
      // // Sign in using a redirect.
      // firebase.auth().getRedirectResult().then(function(result) {
      //   if (result.credential) {
      //     // This gives you a Google Access Token.
      //     var token = result.credential.accessToken;
      //   }
      //   var user = result.user;
      //   console.log(user);
      //   _this.$router.push("/profile");
      // })
      // // Start a sign in process for an unauthenticated user.
      // var provider = new firebase.auth.FacebookAuthProvider();
      // // provider.addScope('user_birthday');
      // firebase.auth().signInWithRedirect(provider);

      // Sign in using a popup.
      var provider = new firebase.auth.FacebookAuthProvider();
      // provider.addScope('user_birthday');
      firebase.auth().signInWithPopup(provider).then(function(result) {
        // This gives you a Facebook Access Token.
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        console.log(user);
        _this.isSignin = true;
        _this.$router.push("/profile");
      }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;

        // The email of the user's account used.
        var email = error.email;

        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
        console.log(error);
        // console.log(errorCode, errorMessage);

        // 전자우편 주소가 다른 인증방식으로 이미 등록된 경우
        if(errorCode === "auth/account-exists-with-different-credential") {
          // User's email already exists.
          // Get sign-in methods for this email.
          // 전자우편을 기준으로 등록된 인증방식을 얻어옵니다.
          firebase.auth().fetchSignInMethodsForEmail(email).then(function(methods) {
            console.log(methods);

            // If the user has several sign-in methods, the first method in the list will be the "recommended" method to use.
            // 첫번째 방식과 연결하는 것을 추천합니다.
            if (methods[0] === 'password') {
              // Asks the user their password.
              // In real scenario, you should handle this asynchronously.
              // var password = promptUserForPassword(); // TODO: implement promptUserForPassword.
              var password = prompt(email + "계정의 암호를 입력하십시오.");
              firebase.auth().signInWithEmailAndPassword(email, password).then(function(user) {
                // Step 4a.
                return user.linkWithCredential(credential);
              }).then(function() {
                // account successfully linked to the existing Firebase user.
                _this.isSignin = true;
                _this.$router.push("/profile");
              });
              return;
            }

            // All the other cases are external providers.
            // Construct provider object for that provider.
            // 인븡 방법에 따라 인증제공자 객체를 얻어옵니다.
            var provider = _this.getProviderForProviderId(methods[0]);
            // At this point, you should let the user know that they already has an account
            // but with a different provider, and let them validate the fact they want to
            // sign in with this provider.
            // Sign in to provider. Note: browsers usually block popup triggered asynchronously,
            // so in real scenario you should ask the user to click on a "continue" button
            // that will trigger the signInWithPopup.
            // 다른 방식으로 인증합니다.
            firebase.auth().signInWithPopup(provider).then(function(result) {
              // Remember that the user may have signed in with an account that has a different email
              // address than the first one. This can happen as Firebase doesn't control the provider's
              // sign in flow and the user is free to login using whichever account they own.
              
              // Link to Google credential.
              // As we have access to the pending credential, we can directly call the link method.
              // 인증이 완료되면 2개의 인증을 연결합니다.
              result.user.linkAndRetrieveDataWithCredential(credential).then(function(usercred) {
                // Account successfully linked to the existing Firebase user.
                _this.isSignin = true;
                _this.$router.push("/profile");
              });
            });
          });
        }
        // Uncaught 
        // uh {code: "auth/account-exists-with-different-credential", message: "An account already exists with the same email addr…ng a provider associated with this email address.", a: null, email: "parandol76@gmail.com", credential: Hg}
        // a: null
        // code: "auth/account-exists-with-different-credential"
        // credential: Hg {a: null, accessToken: "EAAIvNadEQfcBAGUhmsTZCByNvU5u19WDLZBsE4sXLIi1YwnJ9…2jBBfFlNiV89JfASZCcvjiaeWEHUIvZBGCLjUD98SCp5gZDZD", providerId: "facebook.com", signInMethod: "facebook.com"}
        // email: "parandol76@gmail.com"
        // message: "An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address."
        // __proto__: t
      });
    },
    getProviderForProviderId(method) {
      switch(method) {
        case "google.com":
          return new firebase.auth.GoogleAuthProvider();
        case "facebook":
          return new firebase.auth.FacebookAuthProvider();
      }
    },
    kakao() {
      
    },
    naver() {

    },
    twitter() {
      
    }
  }
}
</script>