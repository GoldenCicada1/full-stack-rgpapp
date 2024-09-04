import AppLayout from '@/layout/AppLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { isAuthenticated } from '@/service/authService';

// Function to check if the user is authenticated
const requireAuth = (to, from, next) => {
    const token = isAuthenticated(); // Function to retrieve the token from storage
    if (token) {
        next(); // User is authenticated, proceed to the route
    } else {
        next({ name: 'login' }); // Redirect to login page
    }
};

// Function to redirect authenticated users away from login
const redirectIfAuthenticated = (to, from, next) => {
    const token = isAuthenticated(); // Function to retrieve the token from storage
    if (token) {
        next({ name: 'dashboard' }); // Redirect to dashboard if already logged in
    } else {
        next(); // Proceed to login page
    }
};

const routes = [
    {
        path: '/',
        component: AppLayout,
        beforeEnter: requireAuth, // Protect all child routes
        children: [
            {
                path: '',
                name: 'dashboard',
                component: () => import('@/views/Dashboard.vue')
            },
            {
                path: '/new/land',
                name: 'land',
                component: () => import('@/views/pages/product/land.vue')
            },
            {
                path: '/new/building',
                name: 'building',
                component: () => import('@/views/pages/product/building.vue')
            },
            {
                path: '/uikit/formlayout',
                name: 'formlayout',
                component: () => import('@/views/uikit/FormLayout.vue')
            },
            {
                path: '/uikit/input',
                name: 'input',
                component: () => import('@/views/uikit/InputDoc.vue')
            },
            {
                path: '/uikit/button',
                name: 'button',
                component: () => import('@/views/uikit/ButtonDoc.vue')
            },
            {
                path: '/uikit/table',
                name: 'table',
                component: () => import('@/views/uikit/TableDoc.vue')
            },
            {
                path: '/uikit/list',
                name: 'list',
                component: () => import('@/views/uikit/ListDoc.vue')
            },
            {
                path: '/uikit/tree',
                name: 'tree',
                component: () => import('@/views/uikit/TreeDoc.vue')
            },
            {
                path: '/uikit/panel',
                name: 'panel',
                component: () => import('@/views/uikit/PanelsDoc.vue')
            },

            {
                path: '/uikit/overlay',
                name: 'overlay',
                component: () => import('@/views/uikit/OverlayDoc.vue')
            },
            {
                path: '/uikit/media',
                name: 'media',
                component: () => import('@/views/uikit/MediaDoc.vue')
            },
            {
                path: '/uikit/message',
                name: 'message',
                component: () => import('@/views/uikit/MessagesDoc.vue')
            },
            {
                path: '/uikit/file',
                name: 'file',
                component: () => import('@/views/uikit/FileDoc.vue')
            },
            {
                path: '/uikit/menu',
                name: 'menu',
                component: () => import('@/views/uikit/MenuDoc.vue')
            },
            {
                path: '/uikit/charts',
                name: 'charts',
                component: () => import('@/views/uikit/ChartDoc.vue')
            },
            {
                path: '/uikit/misc',
                name: 'misc',
                component: () => import('@/views/uikit/MiscDoc.vue')
            },
            {
                path: '/uikit/timeline',
                name: 'timeline',
                component: () => import('@/views/uikit/TimelineDoc.vue')
            },
            {
                path: '/pages/empty',
                name: 'empty',
                component: () => import('@/views/pages/Empty.vue')
            },
            {
                path: '/pages/crud',
                name: 'crud',
                component: () => import('@/views/pages/Crud.vue')
            },
            {
                path: '/documentation',
                name: 'documentation',
                component: () => import('@/views/pages/Documentation.vue')
            }
        ]
    },
    {
        path: '/landing',
        name: 'landing',
        component: () => import('@/views/pages/Landing.vue'),
        beforeEnter: redirectIfAuthenticated // Redirect authenticated users away from landing page
    },
    {
        path: '/pages/notfound',
        name: 'notfound',
        component: () => import('@/views/pages/NotFound.vue')
    },
    {
        path: '/auth/login',
        name: 'login',
        component: () => import('@/views/pages/auth/Login.vue'),
        beforeEnter: redirectIfAuthenticated // Redirect authenticated users away from login page
    },
    {
        path: '/auth/access',
        name: 'accessDenied',
        component: () => import('@/views/pages/auth/Access.vue')
    },
    {
        path: '/auth/error',
        name: 'error',
        component: () => import('@/views/pages/auth/Error.vue')
    },
    // Catch-all route for 404 errors
    {
        path: '/:pathMatch(.*)*',
        name: 'catchAll',
        component: () => import('@/views/pages/NotFound.vue')
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
