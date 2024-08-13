<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';
import { logout } from '@/service/authService';

const model = ref([
    {
        label: 'Home',
        items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }]
    },

    {
        label: 'Product Management',
        icon: 'pi pi-fw pi-box',
        items: [
            {
                label: 'Product List',
                icon: 'pi pi-fw pi-list',
                to: '/product-management/list',
                items: [
                    {
                        label: 'Search',
                        icon: 'pi pi-fw pi-search',
                        to: '/product-management/search'
                    },
                    {
                        label: 'Filter',
                        icon: 'pi pi-fw pi-filter',
                        to: '/product-management/filter'
                    },
                    {
                        label: 'Sort',
                        icon: 'pi pi-fw pi-sort',
                        to: '/product-management/sort'
                    }
                ]
            },
            {
                label: 'Add New Product',
                icon: 'pi pi-fw pi-plus',
                to: '/new',
                items: [
                    {
                        label: 'Unit',
                        icon: 'pi pi-fw pi-home',
                        to: '/new/unit'
                    },
                    {
                        label: 'Building',
                        icon: 'pi pi-fw pi-building',
                        to: '/new/building'
                    },
                    {
                        label: 'Land Plot',
                        icon: 'pi pi-fw pi-map',
                        to: '/new/land'
                    }
                ]
            },
            {
                label: 'Edit Product',
                icon: 'pi pi-fw pi-pencil',
                to: '/product-management/edit',
                items: [
                    {
                        label: 'Unit',
                        icon: 'pi pi-fw pi-building',
                        to: '/product-management/edit/unit'
                    },
                    {
                        label: 'Building',
                        icon: 'pi pi-fw pi-building',
                        to: '/product-management/edit/building'
                    },
                    {
                        label: 'Land Plot',
                        icon: 'pi pi-fw pi-map',
                        to: '/product-management/edit/land'
                    }
                ]
            },
            {
                label: 'Delete Product',
                icon: 'pi pi-fw pi-trash',
                to: '/product-management/delete',
                items: [
                    {
                        label: 'Confirm Deletion',
                        icon: 'pi pi-fw pi-check-circle',
                        to: '/product-management/delete/confirm'
                    }
                ]
            }
        ]
    },

    {
        label: 'UI Components',
        items: [
            { label: 'Form Layout', icon: 'pi pi-fw pi-id-card', to: '/uikit/formlayout' },
            { label: 'Input', icon: 'pi pi-fw pi-check-square', to: '/uikit/input' },
            { label: 'Button', icon: 'pi pi-fw pi-mobile', to: '/uikit/button', class: 'rotated-icon' },
            { label: 'Table', icon: 'pi pi-fw pi-table', to: '/uikit/table' },
            { label: 'List', icon: 'pi pi-fw pi-list', to: '/uikit/list' },
            { label: 'Tree', icon: 'pi pi-fw pi-share-alt', to: '/uikit/tree' },
            { label: 'Panel', icon: 'pi pi-fw pi-tablet', to: '/uikit/panel' },
            { label: 'Overlay', icon: 'pi pi-fw pi-clone', to: '/uikit/overlay' },
            { label: 'Media', icon: 'pi pi-fw pi-image', to: '/uikit/media' },
            { label: 'Menu', icon: 'pi pi-fw pi-bars', to: '/uikit/menu' },
            { label: 'Message', icon: 'pi pi-fw pi-comment', to: '/uikit/message' },
            { label: 'File', icon: 'pi pi-fw pi-file', to: '/uikit/file' },
            { label: 'Chart', icon: 'pi pi-fw pi-chart-bar', to: '/uikit/charts' },
            { label: 'Timeline', icon: 'pi pi-fw pi-calendar', to: '/uikit/timeline' },
            { label: 'Misc', icon: 'pi pi-fw pi-circle', to: '/uikit/misc' }
        ]
    },
    {
        label: 'Pages',
        icon: 'pi pi-fw pi-briefcase',
        to: '/pages',
        items: [
            // {
            //     label: 'Landing',
            //     icon: 'pi pi-fw pi-globe',
            //     to: '/landing'
            // },
            {
                label: 'Auth',
                icon: 'pi pi-fw pi-user',
                items: [
                    {
                        label: 'Login',
                        icon: 'pi pi-fw pi-sign-in',
                        to: '/auth/login'
                    },
                    {
                        label: 'Error',
                        icon: 'pi pi-fw pi-times-circle',
                        to: '/auth/error'
                    },
                    {
                        label: 'Access Denied',
                        icon: 'pi pi-fw pi-lock',
                        to: '/auth/access'
                    }
                ]
            },
            {
                label: 'Crud',
                icon: 'pi pi-fw pi-pencil',
                to: '/pages/crud'
            },
            {
                label: 'Not Found',
                icon: 'pi pi-fw pi-exclamation-circle',
                to: '/pages/notfound'
            },
            {
                label: 'Empty',
                icon: 'pi pi-fw pi-circle-off',
                to: '/pages/empty'
            }
        ]
    },
    {
        label: 'Hierarchy',
        items: [
            {
                label: 'Submenu 1',
                icon: 'pi pi-fw pi-bookmark',
                items: [
                    {
                        label: 'Submenu 1.1',
                        icon: 'pi pi-fw pi-bookmark',
                        items: [
                            { label: 'Submenu 1.1.1', icon: 'pi pi-fw pi-bookmark' },
                            { label: 'Submenu 1.1.2', icon: 'pi pi-fw pi-bookmark' },
                            { label: 'Submenu 1.1.3', icon: 'pi pi-fw pi-bookmark' }
                        ]
                    },
                    {
                        label: 'Submenu 1.2',
                        icon: 'pi pi-fw pi-bookmark',
                        items: [{ label: 'Submenu 1.2.1', icon: 'pi pi-fw pi-bookmark' }]
                    }
                ]
            },
            {
                label: 'Submenu 2',
                icon: 'pi pi-fw pi-bookmark',
                items: [
                    {
                        label: 'Submenu 2.1',
                        icon: 'pi pi-fw pi-bookmark',
                        items: [
                            { label: 'Submenu 2.1.1', icon: 'pi pi-fw pi-bookmark' },
                            { label: 'Submenu 2.1.2', icon: 'pi pi-fw pi-bookmark' }
                        ]
                    },
                    {
                        label: 'Submenu 2.2',
                        icon: 'pi pi-fw pi-bookmark',
                        items: [{ label: 'Submenu 2.2.1', icon: 'pi pi-fw pi-bookmark' }]
                    }
                ]
            }
        ]
    },
    {
        label: 'Get Started',
        items: [
            // {
            //     label: 'Documentation',
            //     icon: 'pi pi-fw pi-book',
            //     to: '/documentation'
            // },
            {
                label: 'Logout',
                icon: 'pi pi-fw pi-sign-out',
                command: async () => {
                    await logout(); // Call the logout function
                    location.href = 'auth/login'; // Redirect to the login page'
                }
            }
        ]
    }
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
