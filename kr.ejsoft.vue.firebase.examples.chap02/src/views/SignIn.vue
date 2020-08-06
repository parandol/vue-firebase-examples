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
              ></v-text-field>

              <v-text-field
                id="password"
                label="Password"
                name="password"
                prepend-icon="mdi-lock"
                type="password"
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
      password : "",
      isSignin: false,
  }),
  created: () => {
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
      console.log("signin", this.email, this.password);
      if(!this.email) {
        alert("전자우편을 입력하여 주십시오.");
        return;
      }
      
      if(!this.password) {
        alert("암호를 입력하여 주십시오.");
        return;
      }
      
      firebase.auth().signInWithEmailAndPassword(this.email, this.password)
      .then((user) => {
        console.log("User", user)
      })
      .catch((error) => {
        console.log(error)
        if(error && error.message) {
          alert(error.message);
        }
      })
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