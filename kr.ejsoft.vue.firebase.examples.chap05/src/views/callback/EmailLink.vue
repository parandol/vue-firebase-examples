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
        <v-card class="elevation-12"
          v-if="!hasEmail"
        >
          <v-toolbar
            color="primary"
            dark
            flat
          >
            <v-toolbar-title>Email</v-toolbar-title>
            <v-spacer />
          </v-toolbar>
          <v-card-text>
            <v-form>
              <v-text-field
                label="Email"
                name="email"
                prepend-icon="mdi-account"
                v-model="email"
                type="text"
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="primary"
              @click="execSignIn"
            >SignIn</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import firebase from 'firebase';

export default {
  // data: () => ({
  //   hasEmail : true,
  //   email: '',
  // }),
  
  data() {
    return {
      hasEmail : true,
      email: '',
    }
  },
  mounted() {
    console.log(process.env)
  },
  created() {
    const _this = this;
    // Confirm the link is a sign-in with email link.
    if (firebase.auth().isSignInWithEmailLink(window.location.href)) {
      // Additional state parameters can also be passed via URL.
      // This can be used to continue the user's intended action before triggering
      // the sign-in operation.
      // Get the email if available. This should be available if the user completes
      // the flow on the same device where they started it.
      var email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        _this.hasEmail = false;
      } else {
        _this.email = email;
        _this.doSignIn();
      }

    } else {
      alert("잘못된 방법으로 접근하셨습니다. 로그인 페이지로 이동합니다.");
      _this.$router.push("/signin");
      return;
    }
  },
  methods: {
    execSignIn() {
      if(!this.email) {
        alert('전자우편을 입력하여 주십시오.');
        return;
      }

      this.doSignIn();
    },
    doSignIn() {
      const _this = this;
      const email = this.email;
      // The client SDK will parse the code from the link for you.
      firebase.auth().signInWithEmailLink(email, window.location.href)
      .then(function(result) {
        // Clear email from storage.
        window.localStorage.removeItem('emailForSignIn');
        // You can access the new user via result.user
        // Additional user info profile not available via:
        // result.additionalUserInfo.profile == null
        // You can check if the user is new or existing:
        // result.additionalUserInfo.isNewUser
        const user = result.user;
        console.log("User : ", user);
        if(result.additionalUserInfo.isNewUser) {
          console.log("신규 사용자...");
          _this.$router.push("/welcome");   // welcome
        } else {
          _this.$router.push("/profile");
        }
      })
      .catch(function(error) {
        // Some error occurred, you can inspect the code: error.code
        // Common errors could be invalid email and invalid or expired OTPs.
        console.log(error)
        if(error.code === "auth/invalid-action-code") {
          alert("정상적이지 않은 접근입니다. 만료된 데이터이거나 이미 사용된 데이터입니다.");
          _this.$router.push("/signin");
          return;
        }
        // if(error && error.message) {
        //   alert(error.message);
        // }
      });
    }
  }
}
</script>