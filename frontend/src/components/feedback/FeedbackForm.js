import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { MultiSelect } from "primereact/multiselect";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import AssignTourService from "../../services/AssignTourService";
import UserService from "../../services/UserService";
import FeedbackService from "../../services/FeedbackService";

const FeedbackForm = () => {
  const [visible, setVisible] = useState(false);
  const [content, setContent] = useState("");
  const [tours, setTours] = useState([]); // Tours the logged-in user has done
  const [users, setUsers] = useState([]); // Users for the selected tour
  const [selectedTour, setSelectedTour] = useState(null); // Selected tour
  const [selectedUsers, setSelectedUsers] = useState([]); // Selected users for feedback
  const toast = React.useRef(null);

  useEffect(() => {
    // Fetch tours for the logged-in user on initial render
    const fetchTours = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) throw new Error("Logged-in user ID not found.");

        const response = await AssignTourService.getToursByUserId(userId);
        const toursData = response.data; // Ensure this matches the API response structure
        const formattedTours = toursData.map((tour) => ({
          label: `${tour.school_name} - ${new Date(tour.date).toLocaleDateString()}`,
          value: tour.tour_id,
        }));
        setTours(formattedTours);
      } catch (error) {
        console.error("Error fetching tours:", error);
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to load tours.",
          life: 3000,
        });
      }
    };

    fetchTours();
  }, []);

  const fetchUsersByTour = async (tourId) => {
    if (!tourId) {
      setUsers([]);
      return;
    }

    try {
      const response = await AssignTourService.getUsersByTourId(tourId);
      const usersData = response.data; // Ensure this matches the API response structure
      const formattedUsers = usersData.map((user) => ({
        label: user.first_name + " " + user.last_name, // Concatenate first and last name
        value: user.user_id,
      }));
      setUsers(formattedUsers);
    } catch (error) {
      console.error("Error fetching users for the tour:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load users for the selected tour.",
        life: 3000,
      });
    }
  };

  const handleTourSelection = (tourId) => {
    setSelectedTour(tourId);
    setSelectedUsers([]); // Reset selected users when the tour changes
    fetchUsersByTour(tourId); // Fetch users based on the selected tour
  };

  const handleSubmit = async () => {
    try {
      const senderId = localStorage.getItem("userId");
      if (!senderId) {
        throw new Error("Logged-in user ID not found in localStorage.");
      }
      console.log(selectedUsers)
      const feedbackData = {
        user_ids: selectedUsers.map((id) => parseInt(id, 10)), // Ensure integers
        tour_id: selectedTour,
        text_feedback: content || null,
        sender_id: parseInt(senderId, 10),
      };

      const response = await FeedbackService.createFeedback(feedbackData);

      if (response.success) {
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Feedback submitted successfully.",
          life: 3000,
        });
        setVisible(false);
        resetForm();
      } else {
        throw new Error("Failed to submit feedback.");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Failed to submit feedback.",
        life: 3000,
      });
    }
  };

  const resetForm = () => {
    setContent("");
    setSelectedTour(null);
    setSelectedUsers([]);
    setUsers([]);
  };

  const renderFooter = () => {
    return (
      <div>
        <Button
          label="Cancel"
          icon="pi pi-times"
          onClick={() => setVisible(false)}
          className="p-button-text"
        />
        <Button
          label="Submit"
          icon="pi pi-check"
          onClick={handleSubmit}
          autoFocus
        />
      </div>
    );
  };

  return (
    <>
      <Toast ref={toast} />

      <Button
        icon="pi pi-plus"
        className="p-button-rounded p-button-lg"
        style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          width: "4rem",
          height: "4rem",
        }}
        onClick={() => setVisible(true)}
      />

      <Dialog
        header="New Feedback"
        visible={visible}
        style={{ width: "50vw" }}
        onHide={() => setVisible(false)}
        footer={renderFooter()}
      >
        <div className="p-fluid">
          <div className="field mt-4">
            <label htmlFor="tour" className="font-bold">
              Select Tour
            </label>
            <Dropdown
              id="tour"
              value={selectedTour}
              options={tours}
              onChange={(e) => handleTourSelection(e.value)}
              placeholder="Select a tour"
              className="mt-2"
              filter
            />
          </div>

          <div className="field mt-4">
            <label htmlFor="users" className="font-bold">
              Select Users
            </label>
            <MultiSelect
              id="users"
              value={selectedUsers}
              options={users}
              onChange={(e) => setSelectedUsers(e.value)}
              placeholder="Select users to tag"
              className="mt-2"
              filter
              disabled={!selectedTour} // Disable until a tour is selected
            />
          </div>

          <div className="field mt-4">
            <label htmlFor="content" className="font-bold">
              Content (Optional)
            </label>
            <InputTextarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="mt-2"
              placeholder="Write your feedback here... (optional)"
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default FeedbackForm;
