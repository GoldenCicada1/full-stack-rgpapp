import axios from 'axios';

const API_URL = 'http://localhost:8800/api/admin/auth/';

// Login function to authenticate and store token
export const login = async (username, password) => {
    try {
        const response = await axios.post(`${API_URL}login`, { username, password }, { withCredentials: true });
        if (response.status === 200 && response.data.token) {
            localStorage.setItem('authToken', response.data.token); // Store token in local storage
        }
        return response; // Return the full response object
    } catch (error) {
        console.error('Login error:', error.response ? error.response.data : error.message);
        throw new Error(error.response?.data?.message || 'Login failed');
    }
};

// Logout function to clear token from local storage
export const logout = async () => {
    try {
        await axios.post(`${API_URL}logout`, {}, { withCredentials: true });
        localStorage.removeItem('authToken'); // Clear token from local storage
    } catch (error) {
        console.error('Logout error:', error.response ? error.response.data : error.message);
        throw new Error(error.response?.data?.message || 'Logout failed');
    }
};

// Function to check if user is authenticated
export const isAuthenticated = () => {
    const token = localStorage.getItem('authToken');
    return token !== null; // Return true if token exists
};

// Function to get authorization header with token
export const getAuthHeader = () => {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {}; // Return header with token if it exists
};
