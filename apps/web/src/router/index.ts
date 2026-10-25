import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history:createWebHistory(),
    routes:[
        {
            path:'/',
            redirect: '/chat',
        },
        {
            path:'/chat',
            component:()=>import('@/views/chat/ChatView.vue')
        },
        {
            path:'/admin',
            component:()=>import('@/views/admin/Dashboard.vue')
        },
    ]
})

export default router;