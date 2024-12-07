import axios from "axios";

const BASE_URL = "http://localhost:3001/fairs";

export const fetchFairs = async (status = null) => {
    try {
        const params = status ? { status } : {};
        const response = await axios.get(BASE_URL, { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching fairs:", error);
        throw error;
    }
};

export const requestToJoinFair = async (fairId, guideId) => {
    try {
        await axios.post(`${BASE_URL}/fair-requests`, { fair_id: fairId, guide_id: guideId });
    } catch (error) {
        if (error.response?.status === 400) {
            alert(error.response.data.message); // Show "You already applied" message
        } else {
            console.error("Error sending join request:", error);
            throw error;
        }
    }
};


export const fetchAvailableGuides = async (fairId) => {
    try {
        const response = await axios.get(`${BASE_URL}/available-guides`, { params: { fairId } });
        console.log(response.data)
        return response.data;
    } catch (error) {
        console.error("Error fetching guides:", error);
        throw error;
    }
};

export const assignGuide = async (fairId, column, guideId) => {
    try {
        await axios.put(`${BASE_URL}/${fairId}/assign`, { column, guideId });
    } catch (error) {
        console.error("Error assigning guide:", error);
        throw error;
    }
};

export const approveFair = async (fairId) => {
    try {
        const response = await axios.put(`${BASE_URL}/${fairId}/approve`);
        return response.data;
    } catch (error) {
        console.error("Error approving fair:", error);
        throw error;
    }
};

export const cancelFair = async (fairId) => {
    try {
        const response = await axios.put(`${BASE_URL}/${fairId}/cancel`);
        return response.data;
    } catch (error) {
        console.error("Error cancelling fair:", error);
        throw error;
    }
};

export const unassignGuide = async (fairId, column) => {
    try {
        const response = await axios.put(`${BASE_URL}/${fairId}/unassign`, { column });
        return response.data;
    } catch (error) {
        console.error("Error unassigning guide:", error);
        throw error;
    }
};
