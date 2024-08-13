<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

import { LandFeatureService } from '@/service/LandFeature.js'; // Import the service

const selectedAutoValue = ref(null);
const autoFilteredValue = ref([]);
const autoValue = ref([]);

// Fetch features on component mount
onMounted(() => {
    LandFeatureService.getFeaturesList().then((data) => {
        autoValue.value = data.map((feature) => ({ name: feature }));
        autoFilteredValue.value = [...autoValue.value];
    });
});

// Filter the list of features based on the user's input
function searchLandFeature(event) {
    setTimeout(() => {
        if (!event.query.trim().length) {
            autoFilteredValue.value = [...autoValue.value];
        } else {
            autoFilteredValue.value = autoValue.value.filter((feature) => {
                return feature.name.toLowerCase().startsWith(event.query.toLowerCase());
            });
        }
    }, 250);
}

const calendarValue = ref(null);
const radioValue = ref(null);
const currentStep = ref('1');
const land = ref({
    name: '',
    description: '',
    size: '',
    features: [],
    zoning: '',
    soilStructure: '',
    topography: '',
    postalZipCode: '',
    accessibility: ''
});
const location = ref({
    country: '',
    stateRegion: '',
    districtCounty: '',
    ward: '',
    streetVillage: '',
    latitude: '',
    longitude: ''
});

const dropdownValues = ref([
    { name: 'Tanzania, United Republic of', code: 'TZ' },
    { name: 'Kenya', code: 'KE' },
    { name: 'Uganda', code: 'UG' }
]);

const dropdownValues2 = ref([
    { name: 'Dar es Salaam', code: 'DSM' },
    { name: 'Mwanza', code: 'MW' },
    { name: 'Morogoro', code: 'MG' }
]);

const zoningOptions = ref([
    { name: 'Residential', code: 'RES' },
    { name: 'Commercial', code: 'COM' },
    { name: 'Industrial', code: 'IND' },
    { name: 'Agricultural', code: 'AGR' },
    { name: 'Recreational', code: 'REC' },
    { name: 'Mixed-Use', code: 'MIX' },
    { name: 'Institutional', code: 'INS' },
    { name: 'Open Space', code: 'OSP' }
]);

const soilStructureOptions = ref([
    { name: 'Sandy', code: 'SND' },
    { name: 'Clay', code: 'CLY' },
    { name: 'Silt', code: 'SIL' },
    { name: 'Loam', code: 'LOM' },
    { name: 'Peat', code: 'PEA' },
    { name: 'Saline', code: 'SAL' },
    { name: 'Chalk', code: 'CHK' },
    { name: 'Rock', code: 'ROK' }
]);

const topographyOptions = ref([
    { name: 'Flat', code: 'FLT' },
    { name: 'Hilly', code: 'HIL' },
    { name: 'Mountainous', code: 'MTN' },
    { name: 'Valley', code: 'VAL' },
    { name: 'Slope', code: 'SLO' },
    { name: 'Plateau', code: 'PLT' },
    { name: 'Coastal', code: 'COS' },
    { name: 'Desert', code: 'DES' }
]);

const accessibilityOptions = ref([
    { name: 'Accessible by Paved Road', code: 'PAV' },
    { name: 'Accessible by Unpaved Road', code: 'UNP' },
    { name: 'Near Public Transportation', code: 'PUB' },
    { name: 'Walkable', code: 'WAL' },
    { name: 'Near Major Highway', code: 'HWY' },
    { name: 'Accessible by Ferry', code: 'FER' },
    { name: 'Accessible by Air', code: 'AIR' },
    { name: 'Remote', code: 'REM' },
    { name: 'Proximity to Main Roads', code: 'PMR' },
    { name: 'Accessible via Service Road', code: 'SRD' }
]);

const nextStep = () => {
    if (currentStep.value === '1') {
        currentStep.value = '2';
    } else if (currentStep.value === '2') {
        currentStep.value = '3';
    } else if (currentStep.value === '3') {
        handleSubmit(); // Move to Step 4 after submission
    }
};

const prevStep = () => {
    if (currentStep.value === '3') {
        currentStep.value = '2';
    } else if (currentStep.value === '2') {
        currentStep.value = '1';
    }
};

const handleFileUpload = (event) => {
    // Handle file upload logic here
    const files = event.target.files;
    console.log('Files:', files);
};

const handleSubmit = async () => {
    try {
        // Perform the actual submission to the server
        await axios.post('/api/land', { ...land.value, location: location.value });

        // Fetch the newly created land details from the server
        const response = await axios.get('/api/land/latest'); // Adjust the endpoint as needed
        submittedLand.value = response.data;

        // Move to Step 4
        currentStep.value = '4';
    } catch (error) {
        console.error('Submission error:', error);
        // Handle submission error
    }
};
</script>

<template>
    <Fluid>
        <div class="card md:w-2/3">
            <div class="flex-wrap w-full items-center justify-center">
                <Tabs v-model="activeTab">
                    <TabList>
                        <Tab value="0">Use Existing Id</Tab>
                        <Tab value="1">Create from Scratch</Tab>
                    </TabList>
                    <!-- Tab Panels -->
                    <TabPanel value="0">
                        <Stepper v-model:value="currentStep">
                            <StepList>
                                <Step value="1"></Step>
                                <Step value="2"></Step>
                                <Step value="3"></Step>
                            </StepList>
                        </Stepper>
                        <div class="flex flex-col md:flex-row items-center justify-center gap-8">
                            <div class="md:w-1/2">
                                <form @submit.prevent="handleSubmit">
                                    <!-- Step 1: Location Details -->
                                    <div v-if="currentStep === '1'">
                                        <div class="flex flex-col gap-2 mt-4">
                                            <div class="flex flex-col gap-2">
                                                <AutoComplete id="customId" v-model="land.features" :suggestions="autoFilteredValue" optionLabel="name" placeholder="Search Custom ID" dropdown multiple display="chip" @complete="searchLandFeature" />
                                            </div>

                                            <div class="flex flex-col gap-2 mt-3 mb-4">
                                                <!-- Land Registration Question -->
                                                <p class="text-xl font-semibold">Product Type</p>
                                                <div class="flex flex-col md:flex-row gap-4">
                                                    <!-- Rental Option -->
                                                    <div class="flex items-center">
                                                        <RadioButton id="optionRental" name="registrationStatus" value="Rental" v-model="radioValue" />
                                                        <label for="optionRental" class="ml-2">Rental</label>
                                                    </div>
                                                    <!-- Buy(Sale) Option -->
                                                    <div class="flex items-center">
                                                        <RadioButton id="optionBuySale" name="registrationStatus" value="BuySale" v-model="radioValue" />
                                                        <label for="optionBuySale" class="ml-2">Buy(Sale)</label>
                                                    </div>
                                                    <!-- Both Option -->
                                                    <div class="flex items-center">
                                                        <RadioButton id="optionBoth" name="registrationStatus" value="Both" v-model="radioValue" />
                                                        <label for="optionBoth" class="ml-2">Both</label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="flex flex-col md:flex-row gap-4">
                                                <!-- <div class="flex flex-wrap gap-2 w-full">
                                                    <Button @click="prevStep" label="Previous" severity="secondary" />
                                                </div> -->
                                                <div class="flex flex-wrap gap-2 w-full">
                                                    <Button @click="nextStep" label="Next"></Button>
                                                </div>
                                            </div>

                                            <!-- :disabled="true" -->
                                        </div>
                                    </div>

                                    <!-- Step 2: Land Details -->
                                    <div v-if="currentStep === '2'">
                                        <div class="flex flex-col gap-2">
                                            <div class="flex flex-col gap-2 mt-4">
                                                <InputText id="landName" v-model="land.name" type="text" placeholder="Land Name" />
                                            </div>

                                            <div class="flex flex-col gap-2">
                                                <InputText id="size" v-model="land.size" type="number" placeholder="Size (in square meters)" step="0.01" />
                                            </div>

                                            <div class="flex flex-col gap-2">
                                                <Textarea id="description" v-model="land.description" placeholder="Land Description" :autoResize="true" rows="3" cols="30" />
                                            </div>

                                            <div class="flex flex-col gap-2 mt-3">
                                                <!-- Land Registration Question -->
                                                <p class="text-xl font-semibold">Is the Land Registered?</p>
                                                <div class="flex flex-col md:flex-row gap-4">
                                                    <!-- Yes Option -->
                                                    <div class="flex items-center">
                                                        <RadioButton id="optionYes" name="registrationStatus" value="Yes" v-model="radioValue" />
                                                        <label for="optionYes" class="ml-2">Yes</label>
                                                    </div>
                                                    <!-- No Option -->
                                                    <div class="flex items-center">
                                                        <RadioButton id="optionNo" name="registrationStatus" value="No" v-model="radioValue" />
                                                        <label for="optionNo" class="ml-2">No</label>
                                                    </div>
                                                </div>
                                                <div class="flex flex-col gap-2 mb-6">
                                                    <!-- DatePicker Section -->
                                                    <DatePicker id="registrationDate" :showIcon="true" :showButtonBar="true" v-model="calendarValue" placeholder="Date of Registration" class="mt-2" />
                                                </div>
                                            </div>

                                            <div class="flex flex-col gap-2">
                                                <AutoComplete id="features" v-model="land.features" :suggestions="autoFilteredValue" optionLabel="name" placeholder="Search Features" dropdown multiple display="chip" @complete="searchLandFeature" />
                                            </div>

                                            <div class="flex flex-col gap-2">
                                                <Select id="zoning" v-model="land.zoning" :options="zoningOptions" optionLabel="name" placeholder="Zoning" invalid />
                                            </div>

                                            <div class="flex flex-col gap-2">
                                                <Select id="soilStructure" v-model="land.soilStructure" :options="soilStructureOptions" optionLabel="name" placeholder="Soil Structure" invalid />
                                            </div>
                                            <div class="flex flex-col gap-2">
                                                <Select id="topography" v-model="land.topography" :options="topographyOptions" optionLabel="name" placeholder="Topography" invalid />
                                            </div>

                                            <div class="flex flex-col gap-2">
                                                <InputText id="postalZipCode" v-model="land.postalZipCode" type="text" placeholder="Postal/Zip Code" />
                                            </div>

                                            <div class="flex flex-col gap-2">
                                                <Select id="accessibility" v-model="land.topography" :options="accessibilityOptions" optionLabel="name" placeholder="Accessibility" invalid />
                                            </div>

                                            <div class="flex flex-col md:flex-row gap-4">
                                                <div class="flex flex-wrap gap-2 w-full">
                                                    <Button @click="prevStep" label="Previous" severity="secondary" />
                                                </div>
                                                <div class="flex flex-wrap gap-2 w-full">
                                                    <Button @click="nextStep" label="Next"></Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Step 3: Documents & Review -->
                                    <div v-if="currentStep === '3'">
                                        <div class="mb-4">
                                            <label for="documents" class="block text-xl font-medium mb-2">Upload Documents</label>
                                            <input id="documents" type="file" @change="handleFileUpload" class="w-full p-2 border rounded" />
                                        </div>
                                        <div class="mb-4">
                                            <p class="font-medium">Review your details:</p>
                                            <p><strong>Land Name:</strong> {{ land.name }}</p>
                                            <p><strong>Description:</strong> {{ land.description }}</p>
                                            <p><strong>Size:</strong> {{ land.size }} sq. meters</p>
                                            <p><strong>Features:</strong> {{ land.features.join(', ') }}</p>
                                            <p><strong>Zoning:</strong> {{ land.zoning }}</p>
                                            <p><strong>Soil Structure:</strong> {{ land.soilStructure }}</p>
                                            <p><strong>Topography:</strong> {{ land.topography }}</p>
                                            <p><strong>Postal/Zip Code:</strong> {{ land.postalZipCode }}</p>
                                            <p><strong>Accessibility:</strong> {{ land.accessibility }}</p>
                                            <p><strong>Country:</strong> {{ location.country }}</p>
                                            <p><strong>State/Region:</strong> {{ location.stateRegion }}</p>
                                            <p><strong>District/County:</strong> {{ location.districtCounty }}</p>
                                            <p><strong>Ward:</strong> {{ location.ward }}</p>
                                            <p><strong>Street/Village:</strong> {{ location.streetVillage }}</p>
                                            <p><strong>Latitude:</strong> {{ location.latitude }}</p>
                                            <p><strong>Longitude:</strong> {{ location.longitude }}</p>
                                        </div>
                                        <button @click="prevStep" class="bg-gray-500 text-white p-2 rounded mr-2">Previous</button>
                                        <button type="submit" class="bg-blue-500 text-white p-2 rounded">Submit</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </TabPanel>
                    <TabPanel value="1">
                        <div class="font-semibold text-xl mb-4">Create Land Plot</div>
                        <Stepper v-model:value="currentStep">
                            <StepList>
                                <Step value="1">Location Details</Step>
                                <Step value="2">Land Details</Step>
                                <Step value="3">Review</Step>
                                <Step value="4">Success & View Submission</Step>
                            </StepList>
                        </Stepper>
                        <div class="flex flex-col md:flex-row items-center justify-center gap-8">
                            <div class="md:w-1/2">
                                <form @submit.prevent="handleSubmit">
                                    <!-- Step 1: Location Details -->
                                    <div v-if="currentStep === '1'">
                                        <div class="flex flex-col gap-2 mt-4">
                                            <div class="flex flex-col gap-2">
                                                <Select id="country" v-model="location.country" :options="dropdownValues" optionLabel="name" placeholder="Country" />
                                            </div>
                                            <div class="flex flex-col gap-2">
                                                <Select id="stateRegion" v-model="location.stateRegion" :options="dropdownValues2" optionLabel="name" placeholder="State/Region" invalid />
                                            </div>

                                            <div class="flex flex-col gap-2">
                                                <InputText id="districtCounty" v-model="location.districtCounty" type="text" placeholder="District/County" />
                                            </div>
                                            <div class="flex flex-col gap-2">
                                                <InputText id="ward" v-model="location.ward" type="text" placeholder="Ward" />
                                            </div>
                                            <div class="flex flex-col gap-2">
                                                <InputText id="streetVillage" v-model="location.streetVillage" type="text" placeholder="Street/Village" />
                                            </div>

                                            <div class="flex flex-wrap gap-4">
                                                <div class="flex flex-col grow basis-0 gap-2">
                                                    <InputText id="latitude" v-model="location.latitude" type="text" placeholder="Latitude" />
                                                </div>
                                                <div class="flex flex-col grow basis-0 gap-2">
                                                    <InputText id="latitude" v-model="location.longitude" type="text" placeholder="Longitude" />
                                                </div>
                                            </div>

                                            <div class="flex flex-col md:flex-row gap-4">
                                                <!-- <div class="flex flex-wrap gap-2 w-full">
                                                    <Button @click="prevStep" label="Previous" severity="secondary" />
                                                </div> -->
                                                <div class="flex flex-wrap gap-2 w-full">
                                                    <Button @click="nextStep" label="Next"></Button>
                                                </div>
                                            </div>

                                            <!-- :disabled="true" -->
                                        </div>
                                    </div>

                                    <!-- Step 2: Land Details -->
                                    <div v-if="currentStep === '2'">
                                        <div class="flex flex-col gap-2">
                                            <div class="flex flex-col gap-2 mt-4">
                                                <InputText id="landName" v-model="land.name" type="text" placeholder="Land Name" />
                                            </div>

                                            <div class="flex flex-col gap-2">
                                                <InputText id="size" v-model="land.size" type="number" placeholder="Size (in square meters)" step="0.01" />
                                            </div>

                                            <div class="flex flex-col gap-2">
                                                <Textarea id="description" v-model="land.description" placeholder="Land Description" :autoResize="true" rows="3" cols="30" />
                                            </div>

                                            <div class="flex flex-col gap-2 mt-3">
                                                <!-- Land Registration Question -->
                                                <p class="text-xl font-semibold">Is the Land Registered?</p>
                                                <div class="flex flex-col md:flex-row gap-4">
                                                    <!-- Yes Option -->
                                                    <div class="flex items-center">
                                                        <RadioButton id="optionYes" name="registrationStatus" value="Yes" v-model="radioValue" />
                                                        <label for="optionYes" class="ml-2">Yes</label>
                                                    </div>
                                                    <!-- No Option -->
                                                    <div class="flex items-center">
                                                        <RadioButton id="optionNo" name="registrationStatus" value="No" v-model="radioValue" />
                                                        <label for="optionNo" class="ml-2">No</label>
                                                    </div>
                                                </div>
                                                <div class="flex flex-col gap-2 mb-6">
                                                    <!-- DatePicker Section -->
                                                    <DatePicker id="registrationDate" :showIcon="true" :showButtonBar="true" v-model="calendarValue" placeholder="Date of Registration" class="mt-2" />
                                                </div>
                                            </div>

                                            <div class="flex flex-col gap-2">
                                                <AutoComplete id="features" v-model="land.features" :suggestions="autoFilteredValue" optionLabel="name" placeholder="Search Features" dropdown multiple display="chip" @complete="searchLandFeature" />
                                            </div>

                                            <div class="flex flex-col gap-2">
                                                <Select id="zoning" v-model="land.zoning" :options="zoningOptions" optionLabel="name" placeholder="Zoning" invalid />
                                            </div>

                                            <div class="flex flex-col gap-2">
                                                <Select id="soilStructure" v-model="land.soilStructure" :options="soilStructureOptions" optionLabel="name" placeholder="Soil Structure" invalid />
                                            </div>
                                            <div class="flex flex-col gap-2">
                                                <Select id="topography" v-model="land.topography" :options="topographyOptions" optionLabel="name" placeholder="Topography" invalid />
                                            </div>

                                            <div class="flex flex-col gap-2">
                                                <InputText id="postalZipCode" v-model="land.postalZipCode" type="text" placeholder="Postal/Zip Code" />
                                            </div>

                                            <div class="flex flex-col gap-2">
                                                <Select id="accessibility" v-model="land.topography" :options="accessibilityOptions" optionLabel="name" placeholder="Accessibility" invalid />
                                            </div>

                                            <div class="flex flex-col md:flex-row gap-4">
                                                <div class="flex flex-wrap gap-2 w-full">
                                                    <Button @click="prevStep" label="Previous" severity="secondary" />
                                                </div>
                                                <div class="flex flex-wrap gap-2 w-full">
                                                    <Button @click="nextStep" label="Next"></Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Step 3: Documents & Review -->
                                    <div v-if="currentStep === '3'">
                                        <div class="mb-4">
                                            <label for="documents" class="block text-xl font-medium mb-2">Upload Documents</label>
                                            <input id="documents" type="file" @change="handleFileUpload" class="w-full p-2 border rounded" />
                                        </div>
                                        <div class="mb-4">
                                            <p class="font-medium">Review your details:</p>
                                            <p><strong>Land Name:</strong> {{ land.name }}</p>
                                            <p><strong>Description:</strong> {{ land.description }}</p>
                                            <p><strong>Size:</strong> {{ land.size }} sq. meters</p>
                                            <p><strong>Features:</strong> {{ land.features.join(', ') }}</p>
                                            <p><strong>Zoning:</strong> {{ land.zoning }}</p>
                                            <p><strong>Soil Structure:</strong> {{ land.soilStructure }}</p>
                                            <p><strong>Topography:</strong> {{ land.topography }}</p>
                                            <p><strong>Postal/Zip Code:</strong> {{ land.postalZipCode }}</p>
                                            <p><strong>Accessibility:</strong> {{ land.accessibility }}</p>
                                            <p><strong>Country:</strong> {{ location.country }}</p>
                                            <p><strong>State/Region:</strong> {{ location.stateRegion }}</p>
                                            <p><strong>District/County:</strong> {{ location.districtCounty }}</p>
                                            <p><strong>Ward:</strong> {{ location.ward }}</p>
                                            <p><strong>Street/Village:</strong> {{ location.streetVillage }}</p>
                                            <p><strong>Latitude:</strong> {{ location.latitude }}</p>
                                            <p><strong>Longitude:</strong> {{ location.longitude }}</p>
                                        </div>
                                        <button @click="prevStep" class="bg-gray-500 text-white p-2 rounded mr-2">Previous</button>
                                        <button type="submit" class="bg-blue-500 text-white p-2 rounded">Submit</button>
                                    </div>

                                    <!-- Step 4: Success & View Submission -->
                                    <div v-if="currentStep === '4'">
                                        <div class="mb-4">
                                            <h2 class="text-xl font-bold">Submission Successful</h2>
                                            <p class="mt-2">Here are the details of the submitted land plot:</p>
                                            <div class="mt-4">
                                                <p><strong>Land Name:</strong> {{ submittedLand.name }}</p>
                                                <p><strong>Description:</strong> {{ submittedLand.description }}</p>
                                                <p><strong>Size:</strong> {{ submittedLand.size }} sq. meters</p>
                                                <p><strong>Features:</strong> {{ submittedLand.features.join(', ') }}</p>
                                                <p><strong>Zoning:</strong> {{ submittedLand.zoning }}</p>
                                                <p><strong>Soil Structure:</strong> {{ submittedLand.soilStructure }}</p>
                                                <p><strong>Topography:</strong> {{ submittedLand.topography }}</p>
                                                <p><strong>Postal/Zip Code:</strong> {{ submittedLand.postalZipCode }}</p>
                                                <p><strong>Accessibility:</strong> {{ submittedLand.accessibility }}</p>
                                                <p><strong>Country:</strong> {{ submittedLand.location.country }}</p>
                                                <p><strong>State/Region:</strong> {{ submittedLand.location.stateRegion }}</p>
                                                <p><strong>District/County:</strong> {{ submittedLand.location.districtCounty }}</p>
                                                <p><strong>Ward:</strong> {{ submittedLand.location.ward }}</p>
                                                <p><strong>Street/Village:</strong> {{ submittedLand.location.streetVillage }}</p>
                                                <p><strong>Latitude:</strong> {{ submittedLand.location.latitude }}</p>
                                                <p><strong>Longitude:</strong> {{ submittedLand.location.longitude }}</p>
                                            </div>
                                            <button @click="resetForm" class="bg-blue-500 text-white p-2 rounded">Submit Another</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </TabPanel>
                </Tabs>
            </div>
        </div>
    </Fluid>
</template>
