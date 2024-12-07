import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog"; // Import Dialog from PrimeReact
import { getIndividualTours, approveTour, rejectTour } from "../../services/IndividualTourService"; // Import the service
import '../approveTour/TourApprovalTable.css'; // Assuming you saved the CSS in this file

const IndividualToursTable = () => {
    const [tours, setTours] = useState([]);
    const [rows, setRows] = useState(10);
    const [visible, setVisible] = useState(false); // State for controlling the visibility of the popup
    const [selectedNote, setSelectedNote] = useState(""); // State for storing selected note
    const [userId, setUserId] = useState(localStorage.getItem("userId")); // Get userId from localStorage
    const [userType, setUserType] = useState(localStorage.getItem("userType")); // Get userType from localStorage

    // Function to fetch tours and set the state
    const fetchTours = async () => {
        try {
            const data = await getIndividualTours(); // Call the service method
            setTours(data);

            // Dynamically calculate rows to fit the screen
            const availableHeight = window.innerHeight;
            const rowHeight = 60;
            const headerHeight = 100;
            const footerHeight = 80;
            const rowsToFit = Math.floor((availableHeight - headerHeight - footerHeight) / rowHeight);
            setRows(rowsToFit);
        } catch (error) {
            console.error("Error fetching individual tours:", error);
        }
    };

    useEffect(() => {
        fetchTours(); // Call fetchTours on component mount
    }, []);

    // Function to format the date to dd/mm/yyyy
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    };

    // Open the popup with the note content
    const showNote = (note) => {
        setSelectedNote(note); // Set the selected note to show in the dialog
        setVisible(true); // Show the dialog
    };

    // Close the popup
    const hideNote = () => {
        setVisible(false); // Close the dialog
    };

    // Function to approve a tour by assigning it to the current user
    const handleApproveTour = async (tourId) => {
        try {
            await approveTour(tourId, userId); // Approve the tour by assigning the guide
            alert("Tour approved successfully!"); // Success message
            fetchTours(); // Refresh the table
        } catch (error) {
            console.error("Error approving tour:", error);
            alert("Failed to approve tour. Please try again."); // Failure message
        }
    };

    // Function to reject a tour
    const handleRejectTour = async (tourId) => {
        try {
            await rejectTour(tourId); // Reject the tour
            alert("Tour rejected successfully!"); // Success message
            fetchTours(); // Refresh the table
        } catch (error) {
            console.error("Error rejecting tour:", error);
            alert("Failed to reject tour. Please try again."); // Failure message
        }
    };

    // Body content for the visitor_notes column
    const noteBodyTemplate = (rowData) => {
        if (rowData.visitor_notes) {
            return (
                <Button
                    icon="pi pi-file"
                    className="p-button-notes p-button-rounded" // Blue button class
                    onClick={() => showNote(rowData.visitor_notes)}
                    aria-label="Show Note"
                />
            );
        } else {
            return <span>No Note</span>; // Placeholder text when there is no note
        }
    };

    // Body content for the new action column (+ and Reject buttons)
    const actionBodyTemplate = (rowData) => {
        if (rowData.tour_status === "WAITING") {
            return (
                <div>
                    <Button
                        icon="pi pi-check"
                        className="p-button-success p-button-approve p-button-rounded" // Green button class for approve
                        onClick={() => handleApproveTour(rowData.id)}
                        aria-label="Approve Tour"
                    />
                    {/* Show reject button only for userType 3 and 4 */}
                    {(userType === "3" || userType === "4") && (
                        <Button
                            icon="pi pi-times"
                            className="p-button-danger p-button-reject p-button-rounded" // Red button class for reject
                            onClick={() => handleRejectTour(rowData.id)}
                            aria-label="Reject Tour"
                        />
                    )}
                </div>
            );
        }
        return <span>No action</span>; // No buttons if the tour is not in "WAITING" status
    };

    // Function to combine first and last name into one Guide Name
    const combineGuideName = (rowData) => {
        if (rowData.guide_id === null) {
            return "No guide is assigned yet"; // Return placeholder text if guide_id is null
        }
        return `${rowData.guide_first_name} ${rowData.guide_last_name}`; // Return the actual guide name if guide_id is not null
    };

    // Function to dynamically apply row color based on tour status
    const getRowClass = (tourStatus) => {
        switch (tourStatus) {
            case "APPROVED":
            case "READY":
            case "DONE":
                return "green-row"; // Bright green for approved, ready, or done tours
            case "WAITING":
                return "yellow-row"; // Bright yellow for waiting tours
            case "CANCELLED":
            case "REJECTED":
                return "red-row"; // Bright red for cancelled or rejected tours
            default:
                return "";
        }
    };

    return (
        <div className="table-wrapper" style={{ marginLeft: "200px", overflowX: "hidden" }}>
            <h1 style={{ textAlign: "center", margin: "20px 0" }}>Individual Tours</h1>
            <DataTable
                value={tours}
                paginator
                rows={rows}
                tableStyle={{ width: "100%" }}
                paginatorTemplate="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                currentPageReportTemplate="{first} to {last} of {totalRecords}"
                rowClassName={(data) => getRowClass(data.tour_status)} // Apply the dynamic row class
            >
                <Column field="id" header="ID" style={{ width: "5%" }}></Column>
                <Column field="tour_status" header="Tour Status" style={{ width: "10%" }}></Column>
                <Column field="date" header="Date" style={{ width: "10%" }} body={rowData => formatDate(rowData.date)}></Column>
                <Column field="day" header="Day" style={{ width: "10%" }}></Column>
                <Column field="time" header="Time" style={{ width: "5%" }}></Column>
                <Column field="tour_size" header="Tour Size" style={{ width: "5%" }}></Column>
                <Column field="contact_name" header="Contact Name" style={{ width: "10%" }}></Column>
                <Column field="contact_phone" header="Contact Phone" style={{ width: "10%" }}></Column>
                {/* Guide Name column, combining first and last name */}
                <Column field="major_of_interest" header="Major of Interest" style={{ width: "10%" }}></Column>
                <Column field="visitor_notes" header="Visitor Notes" style={{ width: "5%" }} body={noteBodyTemplate}></Column>
                <Column header="Guide Name" style={{ width: "10%" }} body={combineGuideName}></Column>
                <Column body={actionBodyTemplate} header="Actions" style={{ width: "10%" }}></Column> {/* New column */}
            </DataTable>

            {/* Dialog for displaying the note */}
            <Dialog visible={visible} onHide={hideNote} header="Visitor Notes" modal>
                <p>{selectedNote}</p>
            </Dialog>
        </div>
    );
};

export default IndividualToursTable;
