<script setup>
import { ref, watch, defineEmits, defineProps, computed } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import axios from 'axios';

const props = defineProps({
    modelValue: {
        type: Object,
        default: null
    },
    error: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['update:modelValue', 'update:searchQuery', 'update:error']);

const selectedAutoValue = ref(props.modelValue);
const autoFilteredValue = ref([]);
const searchQuery = ref('');
const touched = ref(false); // Track if the user has interacted with the field
const error = ref(props.error); // Track error messages, initialized from props

const API_URL = 'http://localhost:8800/api/buildings/';

// Fetch building data
const searchBuilding = async (query) => {
    try {
        const url = `${API_URL}${encodeURIComponent(query)}`;
        const response = await axios.get(url, { params: { limit: 10 } });
        autoFilteredValue.value = response.data;
        error.value = ''; // Clear error if data is fetched successfully
    } catch (error) {
        console.error('Error fetching building data:', error);
        autoFilteredValue.value = [];
        error.value = 'Failed to fetch building data'; // Set error message
    }
};

// Debounced search function
const debouncedSearchBuilding = useDebounceFn((query) => {
    searchBuilding(query);
}, 300);

// Watch searchQuery and trigger search
watch(searchQuery, (newQuery) => {
    if (typeof newQuery === 'string') {
        const trimmedQuery = newQuery.trim();
        if (trimmedQuery.length > 0) {
            debouncedSearchBuilding(trimmedQuery);
        } else {
            autoFilteredValue.value = [];
        }
    }
});

// Handle input and emit searchQuery
const handleInput = (event) => {
    const value = event.target.value || '';
    searchQuery.value = value;
    touched.value = true; // Set touched to true when the user interacts with the input
    emit('update:searchQuery', searchQuery.value);
    console.log('Input handled:', value); // Debugging: log the input value
};

// Emit modelValue changes
watch(selectedAutoValue, (newValue) => {
    emit('update:modelValue', newValue);
    console.log('Selected value changed:', newValue); // Debugging: log the new selected value
});

// Compute if input is invalid (empty) after user interaction
const isInvalid = computed(() => touched.value && searchQuery.value.trim() === '');

// Optionally, you might want to emit the invalid state as well
watch(isInvalid, (newInvalid) => {
    if (newInvalid) {
        emit('update:error', 'Field is required');
    } else {
        emit('update:error', '');
    }
});

// Watch for changes in error prop to update local error state
watch(
    () => props.error,
    (newError) => {
        error.value = newError;
    }
);
</script>

<template>
    <div class="flex flex-col gap-2">
        <AutoComplete v-model="selectedAutoValue" :suggestions="autoFilteredValue" optionLabel="customId" placeholder="Search Building" dropdown multiple display="chip" @input="handleInput" :invalid="isInvalid" />

        <Message v-if="error" severity="error">{{ error }}</Message>
    </div>
</template>
