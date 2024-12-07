import axios from "axios";

const API_BASE_URL = "http://localhost:3001";

const FeedbackService = {
  getPaginatedFeedback: async (page, limit = 50) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/feedback/paginated`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching feedback:", error);
      throw new Error("Unable to fetch feedback");
    }
  },

  uploadFeedback: async (tourId, file) => {
    try {
      const formData = new FormData();
      formData.append("tourId", tourId);
      formData.append("file", file);

      const response = await axios.post(`${API_BASE_URL}/feedback/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("Error uploading feedback:", error);
      throw new Error("Unable to upload feedback");
    }
  },

  deleteFeedback: async (feedbackId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/feedback/${feedbackId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting feedback:", error);
      throw new Error("Unable to delete feedback");
    }
  },

  getDownloadLink: async (feedbackId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/feedback/${feedbackId}/download`);
      return response.data;
    } catch (error) {
      console.error("Error generating download link:", error);
      throw new Error("Unable to generate download link");
    }
  },
  createFeedback: async (feedbackData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/feedback/createFeedback`, feedbackData);
      return response.data; // Return the API response
    } catch (error) {
      console.error("Error creating feedback:", error.response?.data || error);
      throw new Error(error.response?.data?.message || "Unable to create feedback");
    }
  },
};

export default FeedbackService;
