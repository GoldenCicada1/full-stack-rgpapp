<script setup>
import { ref } from 'vue';
import ParkingClause from '@/views/clause/parking.vue';
import SearchBuilding from '@/views/productSearch/searchBuilding.vue';
// import axios from 'axios';

const currentStep = ref('1');
const activeTab = ref(0); // Initialize activeTab with a default value

const searchQuery = ref('');
const selectedAutoValue = ref(null);
const searchError = ref(''); // Track error from SearchBuilding

// Loading and status state
const isLoading = ref(false);
const status = ref(''); // Possible values: 'loading', 'success', 'error'

// Function to update search query
const updateSearchQuery = (value) => {
    searchQuery.value = value;
};

// Handle error from SearchBuilding
const handleError = (error) => {
    searchError.value = error;
    status.value = 'error';
};

const productType = ref(null);
const radioValue = ref(null);
const buildingType = ref(null);

// Handle updates from ParkingClause
const handleParkingDataUpdate = (newValue) => {
    parkingData.value = newValue;
    console.log('Updated parking data:', newValue); // Debugging
};

const validateSelectedValue = () => {
    if (!selectedAutoValue.value) {
        searchError.value = 'Please select a building.';
        status.value = 'error';
        return false;
    }
    searchError.value = '';
    return true;
};

// Initialize parking data
const parkingData = ref({});

const nextStep = async () => {
    // Validate selected value from SearchBuilding
    if (!validateSelectedValue()) {
        console.log('Cannot proceed due to validation error:', searchError.value);
        return;
    }

    if (searchError.value) {
        status.value = 'error'; // Set status to error if there's an error
        // Prevent moving to the next step if there's an error
        console.log('Cannot proceed due to the error:', searchError.value);
        return;
    }

    isLoading.value = true;
    status.value = 'loading';
    try {
        // Simulate a delay to show loading animation
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (currentStep.value === '1') {
            //Rental Branch
            if (productType.value === 'Rental' && buildingType.value === 'Residential') {
                currentStep.value = '2-rentalResidential';
            } else if (productType.value === 'Rental' && buildingType.value === 'Commercial') {
                currentStep.value = '2-rentalCommercial';
            } else if (productType.value === 'Rental' && buildingType.value === 'Industrial') {
                currentStep.value = '2-rentalIndustrial';
            } else if (productType.value === 'Rental' && buildingType.value === 'SpecialPurpose') {
                currentStep.value = '2-rentalSpecialPurpose';
            } else if (productType.value === 'Rental' && buildingType.value === 'MixedUse') {
                currentStep.value = '2-rentalMixedUse';

                // BuySale Branch
            } else if (productType.value === 'BuySale' && buildingType.value === 'Residential') {
                currentStep.value = '2-BuySaleResidential';
            } else if (productType.value === 'BuySale' && buildingType.value === 'Commercial') {
                currentStep.value = '2-BuySaleCommercial';
            } else if (productType.value === 'BuySale' && buildingType.value === 'Industrial') {
                currentStep.value = '2-BuySaleIndustrial';
            } else if (productType.value === 'BuySale' && buildingType.value === 'SpecialPurpose') {
                currentStep.value = '2-BuySaleSpecialPurpose';
            } else if (productType.value === 'BuySale' && buildingType.value === 'MixedUse') {
                currentStep.value = '2-BuySaleMixedUse';

                // Both Branch
            } else if (productType.value === 'Both' && buildingType.value === 'Residential') {
                currentStep.value = '2-BothResidential';
            } else if (productType.value === 'Both' && buildingType.value === 'Commercial') {
                currentStep.value = '2-BothCommercial';
            } else if (productType.value === 'Both' && buildingType.value === 'Industrial') {
                currentStep.value = '2-BothIndustrial';
            } else if (productType.value === 'Both' && buildingType.value === 'SpecialPurpose') {
                currentStep.value = '2-BothSpecialPurpose';
            } else if (productType.value === 'Both' && buildingType.value === 'MixedUse') {
                currentStep.value = '2-BothMixedUse';
            }
        } else if (currentStep.value.startsWith('2')) {
            currentStep.value = '3';
        }
        status.value = 'success'; // Set status to success after processing
    } catch (error) {
        status.value = 'error'; // Set status to error if something goes wrong
        console.error('Error during step transition:', error);
    } finally {
        isLoading.value = false;
    }
};

const prevStep = () => {
    if (currentStep.value === '3') {
        if (productType.value === 'Rental' && buildingType.value === 'Residential') {
            currentStep.value = '2-rentalResidential';
        } else if (radioValue.value === 'BuySale') {
            currentStep.value = '2-BuySale';
        } else if (radioValue.value === 'Both') {
            currentStep.value = '2-Both';
        }
    } else if (currentStep.value.startsWith('2')) {
        currentStep.value = '1';
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
                            </StepList>
                        </Stepper>
                        <div class="flex flex-col md:flex-row items-center justify-center gap-8">
                            <div class="md:w-1/2">
                                <form @submit.prevent="handleSubmit">
                                    <!-- Step 1: Product Initial Details -->
                                    <div v-if="currentStep === '1'">
                                        <div class="flex flex-col gap-2 mt-4">
                                            <SearchBuilding v-model="selectedAutoValue" :error="searchError" @update:searchQuery="updateSearchQuery" @update:error="handleError" />

                                            <!-- Product Type Question -->
                                            <div v-if="searchQuery" class="flex flex-col gap-2 mt-3 mb-4">
                                                <p class="text-xl font-semibold">Product Type</p>
                                                <div class="flex flex-col md:flex-row gap-4">
                                                    <!-- Rental Option -->
                                                    <div class="flex items-center">
                                                        <RadioButton id="optionRental" name="registrationStatus" value="Rental" v-model="productType" />
                                                        <label for="optionRental" class="ml-2">Rental</label>
                                                    </div>
                                                    <!-- Buy(Sale) Option -->
                                                    <div class="flex items-center">
                                                        <RadioButton id="optionBuySale" name="registrationStatus" value="BuySale" v-model="productType" />
                                                        <label for="optionBuySale" class="ml-2">Buy(Sale)</label>
                                                    </div>
                                                    <!-- Both Option -->
                                                    <div class="flex items-center">
                                                        <RadioButton id="optionBoth" name="registrationStatus" value="Both" v-model="productType" />
                                                        <label for="optionBoth" class="ml-2">Both</label>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Building Type Question -->
                                            <div v-if="productType" class="flex flex-col gap-2 mt-3 mb-4">
                                                <p class="text-xl font-semibold">Building Type</p>
                                                <div class="flex flex-col md:flex-row gap-4">
                                                    <!-- Residential Option -->
                                                    <div class="flex items-center">
                                                        <RadioButton id="optionResidential" name="buildingType" value="Residential" v-model="buildingType" />
                                                        <label for="optionResidential" class="ml-2">Residential</label>
                                                    </div>
                                                    <!-- Commercial Option -->
                                                    <div class="flex items-center">
                                                        <RadioButton id="optionCommercial" name="buildingType" value="Commercial" v-model="buildingType" />
                                                        <label for="optionCommercial" class="ml-2">Commercial</label>
                                                    </div>
                                                    <!-- Industrial Option -->
                                                    <div class="flex items-center">
                                                        <RadioButton id="optionIndustrial" name="buildingType" value="Industrial" v-model="buildingType" />
                                                        <label for="optionIndustrial" class="ml-2">Industrial</label>
                                                    </div>
                                                </div>

                                                <div class="flex flex-col md:flex-row gap-4">
                                                    <!-- Special Purpose Option -->
                                                    <div class="flex items-center">
                                                        <RadioButton id="optionSpecialPurpose" name="buildingType" value="SpecialPurpose" v-model="buildingType" />
                                                        <label for="optionSpecialPurpose" class="ml-2">Special Purpose</label>
                                                    </div>
                                                    <!-- Mixed Use Option -->
                                                    <div class="flex items-center">
                                                        <RadioButton id="optionMixedUse" name="buildingType" value="MixedUse" v-model="buildingType" />
                                                        <label for="optionMixedUse" class="ml-2">Mixed Use</label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="flex flex-col md:flex-row gap-4">
                                                <!-- <div class="flex flex-wrap gap-2 w-full">
                                                    <Button @click="prevStep" label="Previous" severity="secondary" />
                                                </div> -->
                                                <div class="flex flex-wrap gap-2 w-full">
                                                    <Button @click="nextStep" :disabled="isLoading" class="relative">
                                                        <template v-if="isLoading">
                                                            <i class="pi pi-spinner pi-spin"></i>
                                                            <!-- PrimeVue spinner icon -->
                                                        </template>
                                                        <template v-else> Next </template></Button
                                                    >
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Step 2: Building Details (Branch Based on Product Type) -->
                                    <div v-if="currentStep.startsWith('2')">
                                        <!-- Branch Based on Product Type Rental-->
                                        <div v-if="currentStep === '2-rentalResidential'" class="flex flex-col gap-2">
                                            <p class="text-xl font-semibold text-center">BUILDING (WHOLE) RESIDENTIAL LEASE AGREEMENT</p>
                                            <!-- Add Rental-specific form inputs -->
                                            <p>The Following are some Detailed questions to be asked in the process of creating a residential lease, and a contract will be formed based on the answers provided,</p>

                                            <Accordion value="0">
                                                <AccordionPanel value="0">
                                                    <ParkingClause :value="parkingData" @update:value="handleParkingDataUpdate" />
                                                </AccordionPanel>
                                                <AccordionPanel value="1">
                                                    <AccordionHeader>Pet Policy</AccordionHeader>
                                                    <AccordionContent> </AccordionContent>
                                                </AccordionPanel>
                                                <AccordionPanel value="2">
                                                    <AccordionHeader>Guests</AccordionHeader>
                                                    <AccordionContent> </AccordionContent>
                                                </AccordionPanel>
                                            </Accordion>

                                            <div class="flex flex-col md:flex-row gap-4">
                                                <div class="flex flex-wrap gap-2 w-full">
                                                    <Button @click="prevStep" label="Previous" severity="secondary" />
                                                </div>
                                                <button type="submit" class="bg-blue-500 text-white p-2 rounded">Submit</button>
                                            </div>
                                        </div>
                                        <div v-if="currentStep === '2-rentalCommercial'" class="flex flex-col gap-2">
                                            <p class="text-xl font-semibold text-center">BUILDING (WHOLE) COMMERCIAL LEASE AGREEMENT</p>
                                            <!-- Add Rental-specific form inputs -->
                                            <div class="flex flex-col md:flex-row gap-4">
                                                <div class="flex flex-wrap gap-2 w-full">
                                                    <Button @click="prevStep" label="Previous" severity="secondary" />
                                                </div>
                                                <div class="flex flex-wrap gap-2 w-full">
                                                    <Button @click="nextStep" label="Next"></Button>
                                                </div>
                                            </div>
                                        </div>
                                        <div v-if="currentStep === '2-rentalIndustrial'" class="flex flex-col gap-2">
                                            <p class="text-xl font-semibold text-center">BUILDING (WHOLE) INDUSTRIAL LEASE AGREEMENT</p>
                                            <!-- Add Rental-specific form inputs -->
                                            <div class="flex flex-col md:flex-row gap-4">
                                                <div class="flex flex-wrap gap-2 w-full">
                                                    <Button @click="prevStep" label="Previous" severity="secondary" />
                                                </div>
                                                <div class="flex flex-wrap gap-2 w-full">
                                                    <Button @click="nextStep" label="Next"></Button>
                                                </div>
                                            </div>
                                        </div>
                                        <div v-if="currentStep === '2-rentalSpecialPurpose'" class="flex flex-col gap-2">
                                            <p class="text-xl font-semibold text-center">BUILDING (WHOLE) SPECIAL PURPOSE LEASE AGREEMENT</p>
                                            <!-- Add Rental-specific form inputs -->
                                            <div class="flex flex-col md:flex-row gap-4">
                                                <div class="flex flex-wrap gap-2 w-full">
                                                    <Button @click="prevStep" label="Previous" severity="secondary" />
                                                </div>
                                                <div class="flex flex-wrap gap-2 w-full">
                                                    <Button @click="nextStep" label="Next"></Button>
                                                </div>
                                            </div>
                                        </div>
                                        <div v-if="currentStep === '2-rentalMixedUse'" class="flex flex-col gap-2">
                                            <p class="text-xl font-semibold text-center">BUILDING (WHOLE) MIXED USE LEASE AGREEMENT</p>
                                            <!-- Add Rental-specific form inputs -->
                                            <div class="flex flex-col md:flex-row gap-4">
                                                <div class="flex flex-wrap gap-2 w-full">
                                                    <Button @click="prevStep" label="Previous" severity="secondary" />
                                                </div>
                                                <div class="flex flex-wrap gap-2 w-full">
                                                    <Button @click="nextStep" label="Next"></Button>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Branch Based on Product Type BuySale-->

                                        <div v-if="currentStep === '2-BuySaleResidential'" class="flex flex-col gap-2">
                                            <p class="text-xl font-semibold">BUILDING (WHOLE) RESIDENTIAL PURCHASE AGREEMENT</p>
                                            <!-- Add Buy/Sale-specific form inputs -->
                                            <div class="flex flex-col md:flex-row gap-4">
                                                <div class="flex flex-wrap gap-2 w-full">
                                                    <Button @click="prevStep" label="Previous" severity="secondary" />
                                                </div>
                                                <div class="flex flex-wrap gap-2 w-full">
                                                    <Button @click="nextStep" label="Next"></Button>
                                                </div>
                                            </div>
                                        </div>
                                        <div v-if="currentStep === '2-BuySaleCommercial'" class="flex flex-col gap-2">
                                            <p class="text-xl font-semibold">BUILDING (WHOLE) COMMERCIAL PURCHASE AGREEMENT</p>
                                            <!-- Add Buy/Sale-specific form inputs -->
                                            <div class="flex flex-col md:flex-row gap-4">
                                                <div class="flex flex-wrap gap-2 w-full">
                                                    <Button @click="prevStep" label="Previous" severity="secondary" />
                                                </div>
                                                <div class="flex flex-wrap gap-2 w-full">
                                                    <Button @click="nextStep" label="Next"></Button>
                                                </div>
                                            </div>
                                        </div>
                                        <div v-if="currentStep === '2-BuySaleIndustrial'" class="flex flex-col gap-2">
                                            <p class="text-xl font-semibold">BUILDING (WHOLE) INDUSTRIAL PURCHASE AGREEMENT</p>
                                            <!-- Add Buy/Sale-specific form inputs -->
                                            <div class="flex flex-col md:flex-row gap-4">
                                                <div class="flex flex-wrap gap-2 w-full">
                                                    <Button @click="prevStep" label="Previous" severity="secondary" />
                                                </div>
                                                <div class="flex flex-wrap gap-2 w-full">
                                                    <Button @click="nextStep" label="Next"></Button>
                                                </div>
                                            </div>
                                        </div>
                                        <div v-if="currentStep === '2-BuySaleSpecialPurpose'" class="flex flex-col gap-2">
                                            <p class="text-xl font-semibold">BUILDING (WHOLE) SPECIAL PURPOSE PURCHASE AGREEMENT</p>
                                            <!-- Add Buy/Sale-specific form inputs -->
                                            <div class="flex flex-col md:flex-row gap-4">
                                                <div class="flex flex-wrap gap-2 w-full">
                                                    <Button @click="prevStep" label="Previous" severity="secondary" />
                                                </div>
                                                <div class="flex flex-wrap gap-2 w-full">
                                                    <Button @click="nextStep" label="Next"></Button>
                                                </div>
                                            </div>
                                        </div>
                                        <div v-if="currentStep === '2-BuySaleMixedUse'" class="flex flex-col gap-2">
                                            <p class="text-xl font-semibold">BUILDING (WHOLE) MIXED USE PURCHASE AGREEMENT</p>
                                            <!-- Add Buy/Sale-specific form inputs -->
                                            <div class="flex flex-col md:flex-row gap-4">
                                                <div class="flex flex-wrap gap-2 w-full">
                                                    <Button @click="prevStep" label="Previous" severity="secondary" />
                                                </div>
                                                <div class="flex flex-wrap gap-2 w-full">
                                                    <Button @click="nextStep" label="Next"></Button>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Branch Based on Product Type BuySale-->

                                        <div v-if="currentStep === '2-BothResidential'" class="flex flex-col gap-2">
                                            <p class="text-xl font-semibold">Both Rental and Purchase Residential Agreement Details</p>
                                            <!-- Add Both-specific form inputs -->
                                            <div class="flex flex-col md:flex-row gap-4">
                                                <div class="flex flex-wrap gap-2 w-full">
                                                    <Button @click="prevStep" label="Previous" severity="secondary" />
                                                </div>
                                                <div class="flex flex-wrap gap-2 w-full">
                                                    <Button @click="nextStep" label="Next"></Button>
                                                </div>
                                            </div>
                                        </div>
                                        <div v-if="currentStep === '2-BothCommercial'" class="flex flex-col gap-2">
                                            <p class="text-xl font-semibold">Both Rental and Purchase Commercial Agreement Details</p>
                                            <!-- Add Both-specific form inputs -->
                                            <div class="flex flex-col md:flex-row gap-4">
                                                <div class="flex flex-wrap gap-2 w-full">
                                                    <Button @click="prevStep" label="Previous" severity="secondary" />
                                                </div>
                                                <div class="flex flex-wrap gap-2 w-full">
                                                    <Button @click="nextStep" label="Next"></Button>
                                                </div>
                                            </div>
                                        </div>
                                        <div v-if="currentStep === '2-BothIndustrial'" class="flex flex-col gap-2">
                                            <p class="text-xl font-semibold">Both Rental and Purchase Industrial Agreement Details</p>
                                            <!-- Add Both-specific form inputs -->
                                            <div class="flex flex-col md:flex-row gap-4">
                                                <div class="flex flex-wrap gap-2 w-full">
                                                    <Button @click="prevStep" label="Previous" severity="secondary" />
                                                </div>
                                                <div class="flex flex-wrap gap-2 w-full">
                                                    <Button @click="nextStep" label="Next"></Button>
                                                </div>
                                            </div>
                                        </div>
                                        <div v-if="currentStep === '2-BothSpecialPurpose'" class="flex flex-col gap-2">
                                            <p class="text-xl font-semibold">Both Rental and Purchase Special Purpose Agreement Details</p>
                                            <!-- Add Both-specific form inputs -->
                                            <div class="flex flex-col md:flex-row gap-4">
                                                <div class="flex flex-wrap gap-2 w-full">
                                                    <Button @click="prevStep" label="Previous" severity="secondary" />
                                                </div>
                                                <div class="flex flex-wrap gap-2 w-full">
                                                    <Button @click="nextStep" label="Next"></Button>
                                                </div>
                                            </div>
                                        </div>
                                        <div v-if="currentStep === '2-BothMixedUse'" class="flex flex-col gap-2">
                                            <p class="text-xl font-semibold">Both Rental and Purchase Mixed Use Agreement Details</p>
                                            <!-- Add Both-specific form inputs -->
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
                                </form>
                            </div>
                        </div>
                    </TabPanel>
                    <TabPanel value="1">
                        <!-- <div class="font-semibold text-xl mb-4">Create Building Plot</div> -->
                        <Stepper v-model:value="currentStep">
                            <StepList>
                                <Step value="1">Location Details</Step>
                                <!-- <Step value="2">Building Details</Step>
                                <Step value="3">Review</Step>
                               <Step value="4">Success & View Submission</Step> -->
                            </StepList>
                        </Stepper>
                    </TabPanel>
                </Tabs>
            </div>
        </div>
    </Fluid>
</template>
