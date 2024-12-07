import axios from "axios";

const BASE_URL = "http://localhost:3001"; // Adjust this to match your backend's base URL

// Get individual tours
export const getIndividualTours = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/individual-tours/getTours`);
        return response.data.data; // Return only the data array
    } catch (error) {
        console.error("Error fetching individual tours:", error);
        throw error; // Rethrow the error to handle it in the component
    }
};

// Approve a tour
export const approveTour = async (tourId, guideId) => {
    try {
        const response = await axios.put(`${BASE_URL}/individual-tours/approveTour/${tourId}`, {
            guide_id: guideId,
            tour_status: "APPROVED",
        });
        return response.data; // Return the updated data
    } catch (error) {
        console.error("Error approving the tour:", error);
        throw error; // Rethrow the error to handle it in the component
    }
};

// Reject a tour
export const rejectTour = async (tourId) => {
    try {
        const response = await axios.put(`${BASE_URL}/individual-tours/rejectTour/${tourId}`, {
            tour_status: "REJECTED",
        });
        return response.data; // Return the updated data
    } catch (error) {
        console.error("Error rejecting the tour:", error);
        throw error; // Rethrow the error to handle it in the component
    }
};
