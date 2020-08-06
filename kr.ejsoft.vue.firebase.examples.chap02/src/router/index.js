import Vue from 'vue'
import VueRouter from 'vue-router'
// import Vote21 from '../views/Vote21.vue'

// Containers
// const DefaultContainer = () => import('@/containers/DefaultContainer')

Vue.use(VueRouter)

const routes = [
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
    name: 'SignIn',
    component: () => import('@/views/SignIn')
  },
  {
    path: '/signup',
    name: 'SignUp',
    component: () => import('@/views/SignUp')
  },
]

const router = new VueRouter({
  // mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
