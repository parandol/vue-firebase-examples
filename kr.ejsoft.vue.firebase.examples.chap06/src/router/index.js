import Vue from 'vue';
import VueRouter from 'vue-router';
import firebase from 'firebase';

// Containers
const BlankContainer = () => import('@/containers/BlankContainer')

Vue.use(VueRouter);

const routes = [
  // {
  //   path: '*',
  //   redirect: '/signin',
  // },
  {
    path: '/',
    name: 'Home',
    redirect: '/signin',
  },
  // {
  //   path: '/signin',
  //   name: 'SignIn',
  //   redirect: '/signin',
  //   component: DefaultContainer,
  //   children: [
  //     {
  //       path: '/',
  //       name: 'Calendar Home',
  //       component: () => import('@/views/SignIn')
  //     },
  //   ]
  // },
  {
    path: '/signin',
    name: 'signin',
    component: () => import('@/views/SignIn'),
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import('@/views/SignUp'),
  },
  {
    path: '/welcome',
    name: 'welcome',
    // component: () => import('@/views/SignUp'),
    redirect: '/profile',
  },
  
  {
    path: '/callback',
    name: 'callback',
    redirect: '/signin',
    component: BlankContainer,
    children: [
      {
        path: 'email',
        name: 'callback-email',
        component: () => import('@/views/callback/EmailLink'),
      },
      {
        path: 'kakaotalk',
        name: 'callback-kakaotalk',
        component: () => import('@/views/callback/KakaoTalk'),
      },
    ]
  },
  // {
  //   path: '/callback/email',
  //   name: 'callback',
  //   component: () => import('@/views/callback/EmailLink'),
  // },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/Profile'),
    meta: {
      requiresAuth: true
    }
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});


router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  if (requiresAuth && !await firebase.auth().currentUser){
    console.log("router", firebase.auth().currentUser)
    next('signin');
  }else{
    next();
  }
});

export default router;
