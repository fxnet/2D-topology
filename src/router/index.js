import Vue from 'vue'
import Router from 'vue-router'
import Default from '@/components/default'
import Welcome from '@/components/welcome'
import Test from '@/components/view3d/test'


import '../assets/style/common.css'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'default',
      component: Default
    },
    {
      path: '/view3d',
      name: 'view3d',
      component: Welcome
    },
    {
      path: '/test',
      name: 'test',
      component: Test
    }
  ]
})
