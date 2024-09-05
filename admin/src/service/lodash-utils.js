// lodash-utils.js

import _ from 'lodash'; // Import lodash using ES module syntax

// Create the debounce function
const debounce = _.debounce(function (func, wait) {
    let timeout; // Declare the timeout variable

    return function (...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}, 300); // Adjust debounce delay as needed

// Export the debounce function as a named export
export { debounce };
