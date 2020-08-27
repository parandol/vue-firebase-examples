
// import necessary modules
// const express = require('express');
// const bodyParser = require('body-parser');
// const request = require('request-promise');
const { RequestCommon } = require('./RequestCommon');

// Firebase setup
const firebaseAdmin = require('firebase-admin');

// you should manually put your service-account.json in the same folder app.js is located at.
// const serviceAccount = require('./service-account.json');
const privateKey = (process.env.VUE_APP_FIREBASE_ADMIN_PRIVATE_KEY || "").split("\\n").join("\n");
const serviceAccount = {
    "type": process.env.VUE_APP_FIREBASE_ADMIN_TYPE,
    "project_id": process.env.VUE_APP_FIREBASE_ADMIN_PROJECT_ID,
    "private_key_id": process.env.VUE_APP_FIREBASE_ADMIN_PRIVATE_KEY_ID,
    "private_key": privateKey,
    "client_email": process.env.VUE_APP_FIREBASE_ADMIN_CLIENT_EMAIL,
    "client_id": process.env.VUE_APP_FIREBASE_ADMIN_CLIENT_ID,
    "auth_uri": process.env.VUE_APP_FIREBASE_ADMIN_AUTH_URI,
    "token_uri": process.env.VUE_APP_FIREBASE_ADMIN_TOKEN_URI,
    "auth_provider_x509_cert_url": process.env.VUE_APP_FIREBASE_ADMIN_AUTH_PROVIDER_CERT_URL,
    "client_x509_cert_url": process.env.VUE_APP_FIREBASE_ADMIN_CLIENT_CERT_URL
}


console.log("VUE_APP_FIREBASE_ADMIN_PRIVATE_KEY : ", privateKey);

// Kakao API request url to retrieve user profile based on access token
const requestMeUrl = 'https://kapi.kakao.com/v1/user/me?secure_resource=true';

// Initialize FirebaseApp with service-account.json
firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
});


// export const KakaoAuth = new KakaoAuth(){
const KakaoAuth = class KakaoAuth {

    constructor(_vue, options) {
        this.vue = _vue;


        // this.options = Object.assign({
        //     componentid: "NOS_COMPONENT",
        //     npn: false,
        //     npk: false,
        //     npf: false,
        //     kpd: false,
        // }, (options || {}));

        // this.noscomponent = null;

        // this.uuid = npCommon.makeUuid();

        // this.keyset = {};

        // this.keypadmap = {};
        // // this.itemmap = {};
        // this.components = [];

        // this.initialized = false;
        // this.absoluteUse = false;

        // console.log(this.functions);
        // console.log(this.inputs);

        // this.token = _vue.$store.getters.getToken;
        // this.checkedRefresh = false;
    }

    // https://stackoverflow.com/questions/48250832/programmatically-bind-custom-events-for-dynamic-components-in-vuejs?rq=1
    listeners() {
        const _this = this;
        // console.log(inst);
        const ret = {};
        if(_this.options.kpd) {
            // ret.focus = _this.vue.NOS_LISTNERS
            ret.focus = (e) => {
                // console.log(e);
                _this.handler(_this, e);
            }
            // ret.update = (e) => {
            //     console.log(e);
            //     _this.handler(_this, e);
            // }
        }
        return ret;
    }

    /**
     * requestMe - Returns user profile from Kakao API
     *
     * @param  {String} kakaoAccessToken Access token retrieved by Kakao Login API
     * @return {Promiise<Response>}      User profile response in a promise
     */
    requestMe(kakaoAccessToken) {
      console.log('Requesting user profile from Kakao API server.');
      // return request({
      //   method: 'GET',
      //   headers: {'Authorization': 'Bearer ' + kakaoAccessToken},
      //   url: requestMeUrl,
      // });
      return RequestCommon.get(requestMeUrl, {}, {
        'Authorization': 'Bearer ' + kakaoAccessToken
      });
    }
    
    
    /**
     * updateOrCreateUser - Update Firebase user with the give email, create if
     * none exists.
     *
     * @param  {String} userId        user id per app
     * @param  {String} email         user's email address
     * @param  {String} displayName   user
     * @param  {String} photoURL      profile photo url
     * @return {Prommise<UserRecord>} Firebase user record in a promise
     */
    updateOrCreateUser(userId, email, displayName, photoURL) {
      console.log('updating or creating a firebase user');
      const updateParams = {
        provider: 'KAKAO',
        displayName: displayName,
      };
      if (displayName) {
        updateParams['displayName'] = displayName;
      } else {
        updateParams['displayName'] = email;
      }
      if (photoURL) {
        updateParams['photoURL'] = photoURL;
      }
      console.log(updateParams);

      return firebaseAdmin.auth().updateUser(userId, updateParams)
      .catch((error) => {
        if (error.code === 'auth/user-not-found') {
          updateParams['uid'] = userId;
          if (email) {
            updateParams['email'] = email;
          }
          return firebaseAdmin.auth().createUser(updateParams);
        }
        throw error;
      });
    }
    
    
    /**
     * createFirebaseToken - returns Firebase token using Firebase Admin SDK
     *
     * @param  {String} kakaoAccessToken access token from Kakao Login API
     * @return {Promise<String>}                  Firebase token in a promise
     */
    createFirebaseToken(kakaoAccessToken) {
      return this.requestMe(kakaoAccessToken).then((response) => {
        const body = JSON.parse(response);
        console.log(body);
        
        const userId = `kakao:${body.id}`;
        // if (!userId) {
        //   return res.status(404)
        //   .send({message: 'There was no user with the given access token.'});
        // }

        let nickname = null;
        let profileImage = null;
        if (body.properties) {
          nickname = body.properties.nickname;
          profileImage = body.properties.profile_image;
        }
        return this.updateOrCreateUser(userId, body.kaccount_email, nickname, profileImage);

      }).then((userRecord) => {
        const userId = userRecord.uid;
        console.log(`creating a custom firebase token based on uid ${userId}`);
        return firebaseAdmin.auth().createCustomToken(userId, {provider: 'KAKAO'});
      });
    }
    

    verifyToken(token) {

    // actual endpoint that creates a firebase token with Kakao access token
    // app.post('/verifyToken', (req, res) => {
    //     const token = req.body.token;
        // if (!token) return res.status(400).send({error: 'There is no token.'})
        // .send({message: 'Access token is a required parameter.'});
      
        console.log(`Verifying Kakao token: ${token}`);
      
        this.createFirebaseToken(token).then((firebaseToken) => {
          console.log(`Returning firebase token to user: ${firebaseToken}`);

          return {firebase_token: firebaseToken};
        });
    //   });
    }


    token() {

    }

    auth() {
      console.log("kakao.auth");

      RequestCommon.get("https://kauth.kakao.com/oauth/authorize", {
        client_id : 'daae91e38448f6c80df74d8e7070af5f',
        redirect_uri : 'http://localhost:8080/callback/kakaotalk',
        response_type : 'code'
      }, {})
      .then((response) => {
        console.log("Response", response);
      })
      .catch(error => {
        console.log("Error", error);
      });


      // GET /oauth/authorize?client_id={REST_API_KEY}&redirect_uri={REDIRECT_URI}&response_type=code HTTP/1.1
      // Host: kauth.kakao.com


    }

    renewal() {

    }

    signout() {

    }
}

export default KakaoAuth;
