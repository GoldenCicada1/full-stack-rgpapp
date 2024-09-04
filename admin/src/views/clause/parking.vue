<script>
import { ref } from 'vue';

export default {
    name: 'ParkingClause',
    components: {},
    setup() {
        // Parking Clause Start
        const radioValue = ref(null);
        const parkingProvided = ref(null);
        const parkingPayment = ref(null);
        const parkingFee = ref(null);
        const parkingFeeFor = ref(null);
        const parkingFeePaymentMethod = ref(null);
        const parkingFeeAmount = ref(null);
        const parkingPaymentDue = ref(null);
        const feeRefundable = ref(null);
        const describeArrangement = ref(null);
        const sliderValueOfSpaces = ref(0);
        const parkingSpaceDescription = ref('');
        const unauthorizedVehicles = ref([]);
        const vehicleRestrictions = ref(null);
        const specifiedRestrictions = ref([]);
        const maintenanceResponsibility = ref('');
        const additionalRules = ref(null);
        const additionalRulesDetails = ref('');
        const unauthorizedVehiclesOptions = ref([
            'Commercial Vehicles (e.g., delivery trucks, large vans)',
            'Recreational Vehicles (RVs)',
            'Boats/Watercraft',
            'Trailers',
            'Motorcycles',
            'ATVs (All-Terrain Vehicles)',
            'Oversized Vehicles (e.g., buses, large trucks)',
            'Non-operational Vehicles (e.g., vehicles that are not roadworthy)',
            'Heavy Machinery (e.g., construction equipment)',
            'Vehicles with Expired Registration',
            'Vehicles with Hazardous Materials',
            'Unregistered Vehicles',
            'Vehicles with Loud Modifications (e.g., modified exhaust systems)',
            'Uninsured Vehicles',
            'Bicycles (if not stored in designated areas)',
            'Scooters (electric or gas-powered, if not stored in designated areas)'
        ]);
        const restrictionOptions = ref(['Weight Restrictions', 'Size Restrictions', 'Type Restrictions', 'Other Restrictions']);

        // Method to reset all data
        const resetData = () => {
            radioValue.value = null;
            parkingProvided.value = null;
            parkingPayment.value = null;
            parkingFee.value = null;
            parkingFeeFor.value = null;
            parkingFeePaymentMethod.value = null;
            parkingFeeAmount.value = null;
            parkingPaymentDue.value = null;
            feeRefundable.value = null;
            describeArrangement.value = null;
            sliderValueOfSpaces.value = 0;
            parkingSpaceDescription.value = '';
            unauthorizedVehicles.value = [];
            vehicleRestrictions.value = null;
            specifiedRestrictions.value = [];
            maintenanceResponsibility.value = '';
            additionalRules.value = null;
            additionalRulesDetails.value = '';
        };
        return {
            radioValue,
            parkingProvided,
            parkingPayment,
            parkingFee,
            parkingFeeFor,
            parkingFeePaymentMethod,
            parkingFeeAmount,
            parkingPaymentDue,
            feeRefundable,
            describeArrangement,
            sliderValueOfSpaces,
            parkingSpaceDescription,
            unauthorizedVehicles,
            vehicleRestrictions,
            specifiedRestrictions,
            maintenanceResponsibility,
            additionalRules,
            additionalRulesDetails,
            unauthorizedVehiclesOptions,
            restrictionOptions,
            resetData
        };
    }

    // Parking Clause End
};
</script>

<template>
    <AccordionHeader
        >Parking Clause
        <div class="cursor-pointer ml-auto">
            <i class="flex mx-14 pi pi-fw pi-refresh hover:bg-highlight" @click="resetData"></i>
        </div>
    </AccordionHeader>
    <AccordionContent>
        <!-- Section 1: Parking Provision -->
        <div class="flex flex-col gap-2 mt-3 mb-4">
            <!-- Question 1: Is Parking Provided by the Landlord? -->
            <p class="text-xl font-semibold">Is Parking Provided by the Landlord?</p>
            <div class="flex flex-col md:flex-row gap-4">
                <div class="flex items-center">
                    <RadioButton id="parkingProvidedYes" name="parkingProvided" value="Yes" v-model="parkingProvided" />
                    <label for="parkingProvidedYes" class="ml-2">Yes</label>
                </div>
                <div class="flex items-center">
                    <RadioButton id="parkingProvidedNo" name="parkingProvided" value="No" v-model="parkingProvided" />
                    <label for="parkingProvidedNo" class="ml-2">No</label>
                </div>
            </div>
            <!-- If Parking Provided === 'Yes'-->

            <!--Question 2: Whether it is part of the rent or paid separately? -->
            <div v-if="parkingProvided === 'Yes'" class="flex flex-col gap-2 mt-3 mb-4">
                <p class="text-xl font-semibold">Whether it is part of the rent or paid separately?</p>
                <div class="flex flex-col md:flex-row gap-4">
                    <div class="flex items-center">
                        <RadioButton id="partOfRent" name="parkingPayment" value="Part of Rent" v-model="parkingPayment" />
                        <label for="partOfRent" class="ml-2">Part of Rent</label>
                    </div>
                    <div class="flex items-center">
                        <RadioButton id="paidSeparately" name="parkingPayment" value="Paid Separately" v-model="parkingPayment" />
                        <label for="paidSeparately" class="ml-2">Paid Separately</label>
                    </div>
                </div>

                <!-- Section 2: Parking Fee -->
                <div class="flex flex-col gap-2 mt-3 mb-4">
                    <div v-if="parkingPayment === 'Paid Separately'" class="flex flex-col gap-2 mt-3 mb-4">
                        <!-- Question 3: Is There a Parking Fee? -->
                        <p class="text-xl font-semibold">Is There a Parking Fee?</p>
                        <div class="flex flex-col md:flex-row gap-4">
                            <div class="flex items-center">
                                <RadioButton id="parkingFeeYes" name="parkingFee" value="Yes" v-model="parkingFee" />
                                <label for="parkingFeeYes" class="ml-2">Yes</label>
                            </div>
                            <div class="flex items-center">
                                <RadioButton id="parkingFeeNo" name="parkingFee" value="No" v-model="parkingFee" />
                                <label for="parkingFeeNo" class="ml-2">No</label>
                            </div>
                        </div>

                        <!-- Question 4: Is the Parking Fee For -->
                        <div v-if="parkingFee === 'Yes' || parkingFee === 'No'" class="flex flex-col gap-2 mt-3 mb-4">
                            <p class="text-xl font-semibold">Is the Parking Fee For</p>
                            <div class="flex flex-col md:flex-row gap-4">
                                <div class="flex items-center">
                                    <RadioButton id="eachSpace" name="parkingFeeFor" value="Each Parking Space" v-model="parkingFeeFor" />
                                    <label for="eachSpace" class="ml-1">Each Parking Space</label>
                                </div>
                                <div class="flex items-center">
                                    <RadioButton id="allSpaces" name="parkingFeeFor" value="All of the Parking Spaces" v-model="parkingFeeFor" />
                                    <label for="allSpaces" class="ml-1">All of the Parking Spaces</label>
                                </div>
                            </div>
                        </div>

                        <!-- Question 5: How is the Parking Fee Paid? -->
                        <div v-if="parkingFeeFor === 'Each Parking Space' || parkingFeeFor === 'All of the Parking Spaces'" class="flex flex-col gap-2 mt-3 mb-4">
                            <p class="text-xl font-semibold">How is the Parking Fee Paid?</p>
                            <div class="flex flex-col md:flex-row gap-4">
                                <div class="flex items-center">
                                    <RadioButton id="oneTimePayment" name="parkingFeePaymentMethod" value="One-Time Payment" v-model="parkingFeePaymentMethod" />
                                    <label for="oneTimePayment" class="ml-2">One-Time Payment</label>
                                </div>
                                <div class="flex items-center">
                                    <RadioButton id="monthlyPayment" name="parkingFeePaymentMethod" value="Monthly Payment" v-model="parkingFeePaymentMethod" />
                                    <label for="monthlyPayment" class="ml-2">Monthly Payment</label>
                                </div>
                            </div>
                        </div>

                        <!-- Question 6: What is the Amount of the Parking Fee? -->
                        <div v-if="parkingFeePaymentMethod === 'One-Time Payment' || parkingFeePaymentMethod === 'Monthly Payment'" class="flex flex-col gap-2 mt-3 mb-4">
                            <p class="text-xl font-semibold">What is the Amount of the Parking Fee?</p>
                            <InputNumber showButtons v-model="parkingFeeAmount" class="input input-bordered w-full" placeholder="Enter Amount" />
                        </div>

                        <!-- Question 7: When is the Payment for the Parking Space Due? -->
                        <div v-if="parkingFeeAmount" class="flex flex-col gap-2 mt-3 mb-4">
                            <p class="text-xl font-semibold">When is the Payment for the Parking Space Due?</p>
                            <div class="flex flex-col md:flex-row gap-4">
                                <div class="flex items-center">
                                    <RadioButton id="startOfLease" name="parkingPaymentDue" value="At the Start of the Lease" v-model="parkingPaymentDue" />
                                    <label for="startOfLease" class="ml-2">At the Start of the Lease</label>
                                </div>
                                <div class="flex items-center">
                                    <RadioButton id="asPartOfRent" name="parkingPaymentDue" value="As Part of the Rent" v-model="parkingPaymentDue" />
                                    <label for="asPartOfRent" class="ml-2">As Part of the Rent</label>
                                </div>
                            </div>
                        </div>

                        <!-- Question 8: Is the Fee Refundable? -->
                        <div v-if="parkingPaymentDue === 'At the Start of the Lease' || parkingPaymentDue === 'As Part of the Rent'" class="flex flex-col gap-2 mt-3 mb-4">
                            <p class="text-xl font-semibold">Is the Fee Refundable?</p>
                            <div class="flex flex-col md:flex-row gap-4">
                                <div class="flex items-center">
                                    <RadioButton id="refundableYes" name="feeRefundable" value="Yes" v-model="feeRefundable" />
                                    <label for="refundableYes" class="ml-2">Yes</label>
                                </div>
                                <div class="flex items-center">
                                    <RadioButton id="refundableNo" name="feeRefundable" value="No" v-model="feeRefundable" />
                                    <label for="refundableNo" class="ml-2">No</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Section 3: Parking Fee -->
                <div class="flex flex-col gap-2 mt-3 mb-4">
                    <!-- Question 9: How Many Parking Spaces Are Provided? -->

                    <div v-if="parkingPayment === 'Part of Rent' || feeRefundable === 'Yes' || feeRefundable === 'No'" class="flex flex-col gap-2 mt-3 mb-4">
                        <p class="text-xl font-semibold">How Many Parking Spaces Are Provided?</p>
                        <InputText v-model.number="sliderValueOfSpaces" />
                        <Slider v-model="sliderValueOfSpaces" />
                    </div>

                    <!-- Question 10: Would You Like to Describe the Parking Space Arrangement? -->
                    <div v-if="sliderValueOfSpaces" class="flex flex-col gap-2 mt-3 mb-4">
                        <p class="text-xl font-semibold">Would You Like to Describe the Parking Space Arrangement?</p>
                        <div class="flex flex-col md:flex-row gap-4">
                            <div class="flex items-center">
                                <RadioButton id="describeYes" name="describeArrangement" value="Yes" v-model="describeArrangement" />
                                <label for="describeYes" class="ml-2">Yes</label>
                            </div>
                            <div class="flex items-center">
                                <RadioButton id="describeNo" name="describeArrangement" value="No" v-model="describeArrangement" />
                                <label for="describeNo" class="ml-2">No</label>
                            </div>
                        </div>
                    </div>

                    <!-- Question 11: Please Describe the Parking Space(s) -->
                    <div v-if="describeArrangement === 'Yes'" class="flex flex-col gap-2 mt-3 mb-4">
                        <p class="text-xl font-semibold">Please Describe the Parking Space(s):</p>
                        <Textarea v-model="parkingSpaceDescription" class="input input-bordered w-full" placeholder="Enter your answer" :autoResize="true" rows="3" cols="30"></Textarea>
                    </div>

                    <!-- Section 4: Parking Space Regulations -->
                    <div class="flex flex-col gap-2 mt-3 mb-4">
                        <!-- Question 12: What Types of Unauthorized Vehicles Are Not Allowed? -->
                        <div v-if="describeArrangement === 'No' || parkingSpaceDescription" class="flex flex-col gap-2 mt-3 mb-4">
                            <p class="text-xl font-semibold">What Types of Unauthorized Vehicles Are Not Allowed?</p>
                            <div class="flex flex-col gap-2">
                                <label v-for="option in unauthorizedVehiclesOptions" :key="option">
                                    <input type="checkbox" :value="option" v-model="unauthorizedVehicles" />
                                    {{ option }}
                                </label>
                            </div>

                            <!-- Question 13: Is There Any Weight, Size, or Other Restrictions on the Vehicles That Can Use the Parking Space(s)? -->
                            <div v-if="unauthorizedVehicles.length > 0" class="flex flex-col gap-2 mt-3 mb-4">
                                <p class="text-xl font-semibold">Is There Any Weight, Size, or Other Restrictions on the Vehicles That Can Use the Parking Space(s)?</p>
                                <div class="flex flex-col md:flex-row gap-4">
                                    <div class="flex items-center">
                                        <RadioButton id="restrictionsYes" name="vehicleRestrictions" value="Yes" v-model="vehicleRestrictions" />
                                        <label for="restrictionsYes" class="ml-2">Yes</label>
                                    </div>
                                    <div class="flex items-center">
                                        <RadioButton id="restrictionsNo" name="vehicleRestrictions" value="No" v-model="vehicleRestrictions" />
                                        <label for="restrictionsNo" class="ml-2">No</label>
                                    </div>
                                </div>
                            </div>

                            <!-- Question 14: Please Specify What type of restrictions would you like to apply? -->
                            <div v-if="vehicleRestrictions === 'Yes'" class="flex flex-col gap-2 mt-3 mb-4">
                                <p class="text-xl font-semibold">Please Specify What type of restrictions would you like to apply?</p>
                                <div class="flex flex-col gap-2">
                                    <label v-for="restriction in restrictionOptions" :key="restriction">
                                        <input type="checkbox" :value="restriction" v-model="specifiedRestrictions" />
                                        {{ restriction }}
                                    </label>
                                </div>
                            </div>
                        </div>
                        <!-- Section 5: Parking Space Regulations -->

                        <div class="flex flex-col gap-2 mt-3 mb-4">
                            <!-- Question 15: Who is Responsible for Maintaining the Parking Space(s) in Good Condition? -->
                            <div v-if="vehicleRestrictions === 'No' || specifiedRestrictions.length > 0" class="flex flex-col gap-2 mt-3 mb-4">
                                <p class="text-xl font-semibold">Who is Responsible for Maintaining the Parking Space(s) in Good Condition?</p>
                                <div class="flex flex-col md:flex-row gap-4">
                                    <div class="flex items-center">
                                        <RadioButton id="tenant" name="maintenanceResponsibility" value="Tenant(s)" v-model="maintenanceResponsibility" />
                                        <label for="tenant" class="ml-2">Tenant(s)</label>
                                    </div>
                                    <div class="flex items-center">
                                        <RadioButton id="landlord" name="maintenanceResponsibility" value="Landlord" v-model="maintenanceResponsibility" />
                                        <label for="landlord" class="ml-2">Landlord</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- Section 6: Additional Parking Rules -->
                        <!-- Question 16: Are There Any Additional Rules or Regulations for Parking? -->
                        <div v-if="maintenanceResponsibility === 'Tenant(s)' || maintenanceResponsibility === 'Landlord'" class="flex flex-col gap-2 mt-3 mb-4">
                            <p class="text-xl font-semibold">Are There Any Additional Rules or Regulations for Parking?</p>
                            <div class="flex flex-col md:flex-row gap-4">
                                <div class="flex items-center">
                                    <RadioButton id="rulesYes" name="additionalRules" value="Yes" v-model="additionalRules" />
                                    <label for="rulesYes" class="ml-2">Yes</label>
                                </div>
                                <div class="flex items-center">
                                    <RadioButton id="rulesNo" name="additionalRules" value="No" v-model="additionalRules" />
                                    <label for="rulesNo" class="ml-2">No</label>
                                </div>
                            </div>
                        </div>

                        <!-- Question 17: Please Specify -->
                        <div v-if="additionalRules === 'Yes'" class="flex flex-col gap-2 mt-3 mb-4">
                            <p class="text-xl font-semibold">Please Specify</p>
                            <Textarea type="text" v-model="additionalRulesDetails" class="input input-bordered w-full" placeholder="Enter your answer" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- If Parking Provided === 'No'-->
            <div v-if="parkingProvided === 'No'" class="flex flex-col gap-2 mt-3 mb-4">
                <p class="text-sm">Parking is not provided by the Landlord!</p>
            </div>
        </div>
    </AccordionContent>
</template>
