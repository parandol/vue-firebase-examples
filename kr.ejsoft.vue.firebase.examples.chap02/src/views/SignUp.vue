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
            <v-toolbar-title>SignUp</v-toolbar-title>
            <v-spacer></v-spacer>
            
          </v-toolbar>
          <v-card-text>
            <v-form>
              <v-text-field
                label="Email"
                name="email"
                prepend-icon="mdi-account"
                type="text"
                v-model="email"
              ></v-text-field>

              <v-text-field
                id="password"
                label="Password"
                name="password"
                prepend-icon="mdi-lock"
                type="password"
                v-model="password"
              ></v-text-field>

              <v-text-field
                id="confirm"
                label="Confirm Password"
                name="confirm"
                prepend-icon="mdi-alert-circle-check"
                type="password"
                v-model="confirm"
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn color="secondary" @click="$router.push('/signin')">SignIn</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="signup">SignUp</v-btn>
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
      confirm : "",
  }),
  methods: {
    signup() {
      console.log("Signup", this.email, this.password, this.confirm);
      if(!this.email) {
        alert("전자우편을 입력하여 주십시오.");
        return;
      }
      
      if(!this.password) {
        alert("암호를 입력하여 주십시오.");
        return;
      }
      
      if(!this.confirm) {
        alert("암호 확인을 입력하여 주십시오.");
        return;
      }
      
      if(this.password != this.confirm) {
        alert("입력하신 암호가 일치하지 않습니다.");
        return;
      }
      
      firebase.auth().createUserWithEmailAndPassword(this.email, this.password)
      .then((user) => {
        console.log("User", user)
      })
      .catch((error) => {
        console.log(error)
        // if(error.code === "auth/invalid-email") {}
        if(error && error.message) {
          alert(error.message);
        }
      })
    }
  }
}
</script>