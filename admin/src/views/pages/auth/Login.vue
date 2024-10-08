<script setup>
import FloatingConfigurator from '@/components/FloatingConfigurator.vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '@/service/authService';
import { useToast } from 'primevue/usetoast';

const username = ref('');
const password = ref('');
const checked = ref(false);

const router = useRouter();
const toast = useToast();

const handleLogin = async () => {
    try {
        // Call the login function and get the full response
        const response = await login(username.value, password.value);

        // Check if the token is present in the response
        const { token } = response.data;

        if (token) {
            // Store token in local storage
            localStorage.setItem('authToken', token);
            router.push({ name: 'dashboard' }); // Redirect to dashboard or desired route
            toast.add({ severity: 'success', summary: 'Login Successful', detail: 'Redirecting to dashboard...', life: 3000 });
        } else {
            toast.add({ severity: 'error', summary: 'Login Failed', detail: 'No token received', life: 3000 });
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Login Failed', detail: error.message || 'An error occurred', life: 3000 });
    }
};
</script>

<template>
    <FloatingConfigurator />
    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
        <div class="flex flex-col items-center justify-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                    <div class="text-center mb-8">
                        <!-- Add the logo image here -->
                        <img src="/logo.png" alt="Logo" fill="none" class="mb-2 w-28 mx-auto" />
                        <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">ADMIN PANEL</div>
                        <span class="text-muted-color font-medium">Sign in to continue</span>
                    </div>

                    <div>
                        <label for="username" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">User Name</label>
                        <InputText id="username" type="text" placeholder="User Name" class="w-full md:w-[30rem] mb-8" v-model="username" />

                        <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Password</label>
                        <Password id="password1" v-model="password" placeholder="Password" :toggleMask="true" class="mb-4" fluid :feedback="false"></Password>

                        <div class="flex items-center justify-between mt-2 mb-8 gap-8">
                            <div class="flex items-center">
                                <Checkbox v-model="checked" id="rememberme" binary class="mr-2"></Checkbox>
                                <label for="rememberme">Remember me</label>
                            </div>
                            <span class="font-medium no-underline ml-2 text-right cursor-pointer text-primary">Forgot password?</span>
                        </div>
                        <Button label="Sign In" class="w-full" @click="handleLogin"></Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}
</style>
