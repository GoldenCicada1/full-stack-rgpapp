export const LandFeatureService = {
    getFeatures() {
        return [
            'Water Supply',
            'Electricity',
            'Road Access',
            'Public Transportation',
            'Waste Management',
            'Internet Access',
            'Security',
            'Parks and Green Spaces',
            'Schools',
            'Healthcare Facilities',
            'Shopping and Dining',
            'Recreational Facilities',
            'Cultural and Community Centers',
            'Parking',
            'Public Services',
            'Landscaping',
            'Flood Protection',
            'Noise Levels',
            'Climate Control',
            'Accessibility',
            'Utilities Infrastructure',
            'Swimming Pool',
            'Tennis Court',
            'Golf Course',
            'Playgrounds',
            'Dog Parks',
            'Walking Trails',
            'Bike Paths',
            'Gym/Fitness Center',
            'Library',
            'Community Events',
            'Conference Facilities',
            'Business Center',
            'On-site Maintenance',
            'Green Building Certification',
            'Energy Efficiency',
            'Smart Home Features',
            'Eco-friendly Practices',
            'CCTV Surveillance',
            'Gated Community',
            'Private Beach',
            'BBQ Area',
            'Spa/Wellness Center'
        ];
    },

    getFeaturesList() {
        return Promise.resolve(this.getFeatures());
    }
};
