// const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const functions = require('firebase-functions')
const admin = require('firebase-admin')

// CORS Express middleware to enable CORS Requests.
const cors = require('cors')({
    origin: true,
});

require('dotenv').config();

const privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY || "").split("\\n").join("\n");
const serviceAccount = {
    "type": process.env.FIREBASE_ADMIN_TYPE,
    "project_id": process.env.FIREBASE_ADMIN_PROJECT_ID,
    "private_key_id": process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
    "private_key": privateKey,
    "client_email": process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    "client_id": process.env.FIREBASE_ADMIN_CLIENT_ID,
    "auth_uri": process.env.FIREBASE_ADMIN_AUTH_URI,
    "token_uri": process.env.FIREBASE_ADMIN_TOKEN_URI,
    "auth_provider_x509_cert_url": process.env.FIREBASE_ADMIN_AUTH_PROVIDER_CERT_URL,
    "client_x509_cert_url": process.env.FIREBASE_ADMIN_CLIENT_CERT_URL
}


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
})

const request = require('request-promise')






/**
 * createOrFindUser - Update Firebase user with the give email, create if
 * none exists.
 *
 * @param  {Object} params        user id per app
 * @return {Prommise<UserRecord>} Firebase user record in a promise
 */
function createOrFindUser(params) {
    // 신규 사용자 등록
    return admin.auth().createUser(params)
    .catch((err) => {
        // 동일한 메일주소로 이미 가입되어 있는 경우에 사용자 검색하여 반환
        if(err.code === 'auth/email-already-exists') {
            console.log(err);
            // console.log('auth/email-already-exists --------------- ', email);
            return admin.auth().getUserByEmail(params['email']);
        } else {
            throw err;
        }
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
function updateOrCreateUser(userId, email, displayName, photoURL, provider) {
    console.log('updating or creating a firebase user');
    const updateParams = {
        provider: provider,
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

    // 사용자 정보 갱신
    return admin.auth().updateUser(userId, updateParams)
    .catch((error) => {
        if (error.code === 'auth/user-not-found') {
            updateParams['uid'] = userId;
            if (email) {
                updateParams['email'] = email;
            }

            return createOrFindUser(updateParams);
        }
        throw error;
    });
}

/**
 * createFirebaseToken - returns Firebase token using Firebase Admin SDK
 *
 * @param  {String} accessToken access token from Login API
 * @return {Promise<String>}                  Firebase token in a promise
 */
const requestKakaoMeUrl = 'https://kapi.kakao.com/v2/user/me?secure_resource=true'
const requestNaverMeUrl = 'https://openapi.naver.com/v1/nid/me'
function createFirebaseToken(provider, accessToken) {
    return (function() {
        if(provider === 'KAKAO') {
            console.log('Requesting user profile from Kakao API server.')
            return request({
                method: 'GET',
                headers: {'Authorization': 'Bearer ' + accessToken},
                url: requestKakaoMeUrl,
            }).then((response) => {
                console.log("RequestMe : ", response);
                
                const body = JSON.parse(response)
                console.log(body)
        
                const userId = `kakao:${body.id}`
                if (!userId) {
                    return res.status(404)
                    .send({message: 'There was no user with the given access token.'})
                }
                let nickname = null
                let profileImage = null
                if (body.properties) {
                    nickname = body.properties.nickname
                    profileImage = body.properties.profile_image
                }
                let accountEmail = null;
                if(body.kakao_account) {
                    accountEmail = body.kakao_account.email;
                    console.log("Email", accountEmail);
                }
                return updateOrCreateUser(userId, accountEmail, nickname, profileImage, provider)
            })
        } else if(provider === 'NAVER') {
            console.log('Requesting user profile from Naver API server.')
            return request({
                method: 'GET',
                headers: {'Authorization': 'Bearer ' + accessToken},
                url: requestNaverMeUrl,
            }).then((response) => {
                console.log("RequestMe : ", response);
                
                const body = JSON.parse(response)
                console.log(body)
        
                if(body.resultcode === '00') {
                    const profile = body.response;
                    const userId = `naver:${profile.id}`
                    if (!userId) {
                        return res.status(404)
                        .send({message: 'There was no user with the given access token.'})
                    }
                    let displayName = profile.name
                    let profileImage = profile.profile_image
                    let accountEmail = profile.email;
                    console.log("Email", accountEmail);

                    return updateOrCreateUser(userId, accountEmail, displayName, profileImage, provider)
                } else {
                    throw new Error("Request Me Failed.")
                }
            })
        } else {
            throw new Error("Bad request");
        }
    })().then((userRecord) => {
        const userId = userRecord.uid
        console.log(`creating a custom firebase token based on uid ${userId}`)
        return admin.auth().createCustomToken(userId, {provider: provider})
    }).catch((error) => {
        console.log('Error createFirebaseToken', error);
        throw error;
    });
}

const requestKakaoTokenUrl = 'https://kauth.kakao.com/oauth/token'

// exports.kakaoCustomAuth = functions.region('asia-northeast1').https
exports.KakaoAuth = functions.https.onRequest((req, res) => {
    // console.log("Kakao Request:", req);
    try {
        if(req.method === 'POST') {
            let kakaoToken = null;
            let firebaseToken = null;

            const authCode = req.body.data.code;
            console.log("Kakao Auth Code:", authCode);
            if (!authCode) {
                return cors(req, res, () => {
                    res
                    .status(400)
                    .json({error: 'There is no token.', message: 'Access token is a required parameter.'});
                });
            }

            
            console.log(`Verifying Kakao Auth Code: ${authCode}`);
    
            (function(){
                console.log('Requesting user access token from Kakao API server.');

                return request({
                    method: 'POST',
                    headers: {'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'},
                    url: requestKakaoTokenUrl,
                    form: {
                        grant_type: 'authorization_code',
                        client_id: process.env.KAKAO_APP_KEY_REST,
                        redirect_uri: process.env.KAKAO_APP_REDIRECT_URI,
                        code: authCode,
                        // client_secret: ''
                    }
                })
            })().then((response) => {
                console.log(response);

                const body = JSON.parse(response)
                console.log(body);

                kakaoToken = body.access_token;
                console.log("Kakao Access Token:", kakaoToken);
                // console.log(`Verifying Kakao token: ${kakaoToken}`);
                return createFirebaseToken('KAKAO', kakaoToken);
            }).then((fireToken) => {
                firebaseToken = fireToken;
                console.log(`Returning firebase token to user: ${fireToken}`);
                
                return cors(req, res, () => {
                    return res.status(200).json({
                        data : {
                            kakao_token: kakaoToken,
                            firebase_token: firebaseToken
                        }
                    });
                });
            }).catch((error) => {
                console.log(error);
                // console.log(error.body);
                return cors(req, res, () => {
                    if(error.error) {
                        const body = JSON.parse(error.error);
                        res.status(error.statusCode).json({
                            error : {
                                status: error.statusCode,
                                message: body.error,
                                details: body.error_description
                            }
                        });
                    } else {
                        res.status(500).json({error: 'Error'});
                    }
                });
            });

        } else {
            return cors(req, res, () => {
                res.json({});
            });
        }
    } catch(error) {
        console.log(error);
    }
});


const requestNaverTokenUrl = 'https://nid.naver.com/oauth2.0/token'
exports.NaverAuth = functions.https.onRequest((req, res) => {
    // console.log("Kakao Request:", req);
    try {
        if(req.method === 'POST') {
            let naverToken = null;
            let firebaseToken = null;

            const authCode = req.body.data.code;
            console.log("Naver Auth Code:", authCode);
            if (!authCode) {
                return cors(req, res, () => {
                    res
                    .status(400)
                    .json({error: 'There is no token.', message: 'Access token is a required parameter.'});
                });
            }

            
            console.log(`Verifying Naver Auth Code: ${authCode}`);

            const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

            (function(){
                console.log('Requesting user access token from Naver API server.');
                
                return request({
                    method: 'POST',
                    headers: {'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'},
                    url: requestNaverTokenUrl,
                    form: {
                        grant_type: 'authorization_code',
                        client_id: process.env.NAVER_APP_CLIENT_ID,
                        client_secret: process.env.NAVER_APP_CLIENT_SECRET,
                        code: authCode,
                        state: state,
                    }
                })
            })().then((response) => {
                console.log(response);

                const body = JSON.parse(response)
                console.log(body);

                naverToken = body.access_token;
                console.log("Naver Access Token:", naverToken);
                return createFirebaseToken("NAVER", naverToken);
            }).then((fireToken) => {
                firebaseToken = fireToken;
                console.log(`Returning firebase token to user: ${fireToken}`);
                
                return cors(req, res, () => {
                    return res.status(200).json({
                        data : {
                            naver_token: naverToken,
                            firebase_token: firebaseToken
                        }
                    });
                });
            }).catch((error) => {
                console.log(error);
                // console.log(error.body);
                return cors(req, res, () => {
                    if(error.error) {
                        const body = JSON.parse(error.error);
                        res.status(error.statusCode).json({
                            error : {
                                status: error.statusCode,
                                message: body.error,
                                details: body.error_description
                            }
                        });
                    } else {
                        res.status(500).json({error: 'Error'});
                    }
                });
            });

        } else {
            return cors(req, res, () => {
                res.json({});
            });
        }
    } catch(error) {
        console.log(error);
    }
});
