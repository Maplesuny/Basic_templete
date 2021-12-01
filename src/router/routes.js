
const routes = [
  {
    path: '/',
    component: () => import('layouts/myLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      { path: '/bar', component: () => import('pages/bar.vue') },
      { path: '/total', component: () => import('components/Total.vue') },
      { path: '/line', component: () => import('pages/line.vue') },
      { path: '/eeg', component: () => import('pages/eeg.vue') },
      { path: '/eeg2', component: () => import('pages/eeg2.vue') },
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
