// FeedbackService.js
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";
const token = localStorage.getItem("token");

const FeedbackService = {
  /**
   * Submit feedback using the provided token.
   * @param {Object} data - The feedback data.
   * @param {string} data.token - The feedback token.
   * @param {string} data.feedback - The feedback content.
   * @returns {Promise<void>} - Resolves if the feedback is submitted successfully.
   */

  submitFeedback: async (data) => {
    try {
      await axios.post(`${API_BASE_URL}/feedback/submitFeedback`, data);
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error("Feedback token has expired.");
      } else {
        throw new Error(
          error.response?.data?.message ||
            "Failed to submit feedback. Try again."
        );
      }
    }
  },

  getFeedbackByRole: async (userId, userType) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/feedback/getFeedbackByRole`,
        {
          params: { userId, userType },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching feedback by role:", error);
      throw new Error("Unable to fetch feedback by role");
    }
  },

  createFeedback: async (feedbackData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/feedback/createFeedback`,
        feedbackData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating feedback:", error);
      throw new Error(
        error.response?.data?.message || "Unable to create feedback"
      );
    }
  },

  verifyFeedbackToken: async (token) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/feedback/validateToken`,
        {
          params: { token },
        }
      );
      return response.data.success; // Return true if token is valid
    } catch (error) {
      console.error("Error verifying feedback token:", error);
      return false; // Return false if token is invalid or expired
    }
  },

  getFeedbackByToken: async (token) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/feedback/feedbackByToken`,
        {
          params: { token },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching feedback by token:", error);
      throw error;
    }
  },

  updateFeedback: async (updateData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/feedback/updateFeedback`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating feedback:", error);
      throw new Error(error.response?.data?.message || "Unable to update feedback");
    }
  },

  getUsersByIds: async (userIds) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/feedback/getUsersByIds`,
        { userIds },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data; // Return the array of user objects
    } catch (error) {
      console.error("Error fetching users by IDs:", error);
      throw new Error(error.response?.data?.message || "Unable to fetch user details by IDs");
    }
  },  

  deleteFeedback: async (feedbackId) => {
    if (!feedbackId) {
      throw new Error("Feedback ID is required for deletion.");
    }
    try {
      const response = await axios.delete(`${API_BASE_URL}/feedback/${feedbackId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting feedback:", error);
      throw new Error(error.response?.data?.message || "Unable to delete feedback");
    }
  },
  
};

export default FeedbackService;
