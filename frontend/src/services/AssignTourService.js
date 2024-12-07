import axios from "axios";
import { formatDate } from "../components/common/dateUtils";


const API_BASE_URL = "http://localhost:3001";

const AssignTourService = {
  getReadyTours: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tour/readyTours`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching READY tours:", error);
      throw new Error("Unable to fetch tours");
    }
  },

  getAssignedGuides: async (tourId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tour/${tourId}/guideCount`);
      return response.data.guide_count;
    } catch (error) {
      console.error(`Error fetching assigned guides for tour ${tourId}:`, error);
      return 0;
    }
  },

  getCandidateGuides: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tour/candidateGuides`);
      return response.data;
    } catch (error) {
      console.error("Error fetching candidate guides:", error);
      throw new Error("Unable to fetch candidate guides");
    }
  },

  assignGuideToTour: async ({ school_name, city, date, time }) => {
    const userId = localStorage.getItem("userId");
    const tempToken = localStorage.getItem("tempToken"); // Authorization token
    const formattedDate = formatDate(date); // Format the date
    const userType = localStorage.getItem("userType");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/tour/assignGuide`,
        { school_name, city, date: formattedDate, time, user_id: userId, user_type: userType },
        { headers: { Authorization: `Bearer ${tempToken}` } }
      );
      return response.data; // Return the server's response
    } catch (error) {
      console.error("Error assigning guide:", error.response?.data || error);
      throw new Error(error.response?.data?.message || "Unable to assign guide");
    }
  },

  assignCandidateGuidesToTour: async ({ school_name, city, date, time, user_ids }) => {
    const tempToken = localStorage.getItem("tempToken");
    const formattedDate = formatDate(date); // Format the date

    try {
      const response = await axios.post(
        `${API_BASE_URL}/tour/assignCandidate`,
        { school_name, city, date: formattedDate, time, user_ids }, // Pass user_ids here
        { headers: { Authorization: `Bearer ${tempToken}` } }
      );
      return response.data;
    } catch (error) {
      console.error("Error assigning candidate guides:", error.response?.data || error);
      throw new Error(error.response?.data?.message || "Unable to assign candidate guides");
    }
  },

  getMyTours: async () => {
    const userId = localStorage.getItem("userId"); // Assuming user ID is stored in localStorage
    const token = localStorage.getItem("tempToken"); // For authorization
    try {
      const response = await axios.get(`${API_BASE_URL}/tour/myTours`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.tours;
    } catch (error) {
      console.error("Error fetching my tours:", error);
      throw new Error("Unable to fetch my tours");
    }
  },
  withdrawFromTour: async (tourId) => {
    const tempToken = localStorage.getItem("tempToken"); // Ensure the token is included
    try {
      await axios.delete(`${API_BASE_URL}/tour/withdraw/${tourId}`, {
        headers: { Authorization: `Bearer ${tempToken}` },
      });
    } catch (error) {
      console.error("Error withdrawing from tour:", error.response?.data || error);
      throw new Error(error.response?.data?.message || "Unable to withdraw from tour");
    }
  },
  getDoneTours: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tour/doneTours`);
      return response.data.data; // Assuming the API returns the data in this format
    } catch (error) {
      console.error("Error fetching done tours:", error.response?.data || error);
      throw new Error(error.response?.data?.message || "Unable to fetch done tours");
    }
  },
  getToursByUserId: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tour/getToursByUser`, {
        params: { user_id: userId }, // Use query parameters for a single user ID
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching tours by user ID:", error);
      throw new Error("Unable to fetch tours by user ID");
    }
  },
  getUsersByTourId: async (tourId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tour/getUsersByTour`, {
        params: { tour_id: tourId }, // Use query parameters for the API call
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching users by tour ID:", error);
      throw new Error("Unable to fetch users by tour ID");
    }
  }, updateClassroom: async (tourId, classroomInput) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/tour/${tourId}/updateClassroom`, {
        classroom: classroomInput
      });

      return response.data; // Assuming the response contains a message
    } catch (error) {
      console.error('Error updating classroom:', error);
      throw new Error(error.response?.data?.message || 'Something went wrong');
    }
  },

};

export default AssignTourService;
