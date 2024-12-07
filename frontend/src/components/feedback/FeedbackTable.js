import React, { useState, useEffect } from "react";
import FeedbackService from "../../services/FeedbackService";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { FileUpload } from "primereact/fileupload";

const FeedbackTable = () => {
  const [feedback, setFeedback] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupContent, setPopupContent] = useState("");
  const rowsPerPage = 50;

  useEffect(() => {
    fetchFeedback(currentPage);
  }, [currentPage]);

  const fetchFeedback = async (page) => {
    try {
      const data = await FeedbackService.getPaginatedFeedback(page, rowsPerPage);
      const feedbackArray = data.data.rows || [];
      setFeedback(feedbackArray);
      setTotalRecords(data.totalRecords || 500);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    }
  };

  const handlePopupOpen = (content) => {
    setPopupContent(content);
    setPopupVisible(true);
  };

  const handleUpload = async (tourId, file) => {
    try {
      await FeedbackService.uploadFeedback(tourId, file);
    } catch (error) {
      console.error("Error uploading feedback:", error);
    } finally {
      fetchFeedback(currentPage); // Refresh the table after uploading
    }
  };

  const handleDelete = async (feedbackId) => {
    try {
      await FeedbackService.deleteFeedback(feedbackId);
    } catch (error) {
      console.error("Error deleting feedback:", error);
    } finally {
      fetchFeedback(currentPage); // Refresh the table after deleting
    }
  };

  const handleDownload = async (feedbackId) => {
    try {
      const response = await FeedbackService.getDownloadLink(feedbackId);
      if (response.url) {
        window.open(response.url, "_blank");
      }
    } catch (error) {
      console.error("Error generating download link:", error);
    } finally {
      fetchFeedback(currentPage); // Refresh the table after downloading
    }
  };

  return (
    <div>
      <h2>Feedback Table</h2>
      <DataTable value={feedback} paginator rows={rowsPerPage} totalRecords={totalRecords}>
        <Column
          field="tour_date"
          header="Date"
          body={(rowData) => {
            const date = new Date(rowData.tour_date);
            return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
              .toString()
              .padStart(2, "0")}/${date.getFullYear()}`;
          }}
        />
        <Column field="school_name" header="School" />
        <Column field="city" header="City" />
        <Column
          field="user_names"
          header="User"
          body={(rowData) => (
            <div>
              {rowData.user_names?.map((name, index) => (
                <div key={index}>{name}</div>
              )) || "No Users"}
            </div>
          )}
        />
        <Column
          field="user_roles"
          header="Roles"
          body={(rowData) => (
            <div>
              {rowData.user_roles?.map((role, index) => (
                <div key={index}>{role}</div>
              )) || "No Roles"}
            </div>
          )}
        />
        <Column field="sender_name" header="Sender" />
        <Column
          field="text_feedback"
          header="Text Feedback"
          body={(rowData) =>
            rowData.text_feedback ? (
              <Button
                label="View Feedback"
                className="p-button-info"
                onClick={() => handlePopupOpen(rowData.text_feedback)}
              />
            ) : (
              <span>No Feedback Provided</span>
            )
          }
        />
        <Column
          body={(rowData) => (
            <div>
              <Button label="Delete" onClick={() => handleDelete(rowData.feedback_id)} />
              <FileUpload
                mode="basic"
                name="file"
                accept="application/pdf"
                customUpload
                uploadHandler={(e) => handleUpload(rowData.tour_id, e.files[0])}
              />
              <Button
                label="Download"
                className="p-button-primary"
                onClick={() => handleDownload(rowData.feedback_id)}
              />
            </div>
          )}
          header="Actions"
        />
      </DataTable>

      <Dialog
        header="Feedback Details"
        visible={popupVisible}
        style={{ width: "50vw" }}
        onHide={() => setPopupVisible(false)}
      >
        <p>{popupContent}</p>
      </Dialog>
    </div>
  );
};

export default FeedbackTable;
