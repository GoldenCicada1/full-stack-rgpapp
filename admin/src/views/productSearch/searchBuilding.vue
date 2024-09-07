<script setup>
import { ref, watch, defineEmits, defineProps } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import axios from 'axios';

const props = defineProps({
    modelValue: {
        type: Object,
        default: null
    }
});

const emit = defineEmits(['update:modelValue', 'update:searchQuery']);

const selectedAutoValue = ref(props.modelValue);
const autoFilteredValue = ref([]);
const searchQuery = ref('');

const API_URL = 'http://localhost:8800/api/buildings/';

const searchBuilding = async (query) => {
    try {
        const url = `${API_URL}${encodeURIComponent(query)}`;
        const response = await axios.get(url, {
            params: { limit: 10 }
        });
        autoFilteredValue.value = response.data;
    } catch (error) {
        console.error('Error fetching building data:', error);
        autoFilteredValue.value = [];
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

const handleInput = (event) => {
    const value = event.target.value || '';
    searchQuery.value = value;
    emit('update:searchQuery', searchQuery.value);
};

watch(selectedAutoValue, (newValue) => {
    emit('update:modelValue', newValue);
});
</script>

<template>
    <div class="flex flex-col gap-2">
        <AutoComplete v-model="selectedAutoValue" :suggestions="autoFilteredValue" optionLabel="customId" placeholder="Search Building" dropdown multiple display="chip" @input="handleInput" />
    </div>
</template>
