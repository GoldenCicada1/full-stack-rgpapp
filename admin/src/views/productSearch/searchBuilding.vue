<script setup>
import { ref, watch, defineEmits } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import axios from 'axios';

const selectedAutoValue = ref(null);
const autoFilteredValue = ref([]);
const searchQuery = ref('');

const API_URL = 'http://localhost:8800/api/buildings/';

const searchBuilding = async (query) => {
    try {
        // Log the URL for debugging
        const url = `${API_URL}${encodeURIComponent(query)}`;

        // Ensure the query is correctly encoded
        const response = await axios.get(url, {
            params: { limit: 10 }
        });

        // Update the suggestions based on the response
        autoFilteredValue.value = response.data;
    } catch (error) {
        console.error('Error fetching building data:', error);
        autoFilteredValue.value = []; // Clear suggestions on error
    }
};

const debouncedSearchBuilding = useDebounceFn((query) => {
    searchBuilding(query);
}, 300);

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

const emit = defineEmits(['update:searchQuery']);

const handleInput = (event) => {
    const value = event.target.value || ''; // Extract value from event
    searchQuery.value = value;
    emit('update:searchQuery', searchQuery.value);
};
</script>

<template>
    <div class="flex flex-col gap-2">
        <AutoComplete v-model="selectedAutoValue" :suggestions="autoFilteredValue" optionLabel="customId" placeholder="Search Building" dropdown multiple display="chip" @input="handleInput" @complete="debouncedSearchBuilding(searchQuery)" />
    </div>
</template>
