import axios from "axios";

const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";

if (!process.env.REACT_APP_BACKEND_URL) {
    console.warn("REACT_APP_BACKEND_URL is not defined. Using default URL: http://localhost:3001");
}

// Function to get all tours
export const getAllTours = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/tour/allTours`);
        return response.data.data;
    } catch (error) {
        console.error("Error fetching tours:", error);
        throw error;
    }
};
export const approveTour = async (tourId, selectedTime, tourDate) => {
    //console.log(tourId, selectedTime, tourDate);
    return await axios.put(`${BASE_URL}/tour/approve/${tourId}`, {
        selectedTime,
        tourDate, // Include the tourDate in the payload
    });
};

export const rejectTour = async (tourId) => {
    return await axios.put(`${BASE_URL}/tour/reject/${tourId}`);
};
export const cancelTour = async (token) => {
    try {
        const response = await axios.get(`${BASE_URL}/tour/cancel`, {
            params: { token },
        });
        return response.data; // Return success message or relevant data
    } catch (error) {
        console.error("Error canceling tour:", error);
        throw error; // Throw error for the component to handle
    }
};