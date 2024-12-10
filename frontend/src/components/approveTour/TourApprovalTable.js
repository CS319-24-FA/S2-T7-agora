// src/components/TourApprovalTable.jsx
import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog"; // Import Dialog for pop-up
import { Dropdown } from "primereact/dropdown";
import { ToggleButton } from "primereact/togglebutton"; // Import ToggleButton
import { getAllTours, approveTour, rejectTour } from "../../services/ApproveTourService";
import FilterByStatus from "./FilterByStatus"; // Import the FilterByStatus component
import SortByDate from "./SortByDate"; // Import the SortByDate component
import "./TourApprovalTable.css";

const TourApprovalTable = () => {
    const [tours, setTours] = useState([]);
    const [selectedTimes, setSelectedTimes] = useState({});
    const [rows, setRows] = useState(10);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [currentNote, setCurrentNote] = useState("");

    // State variables for filtering and sorting
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [sortOrder, setSortOrder] = useState('none');
    const [sortAsPrioritized, setSortAsPrioritized] = useState(false); // New state for prioritized sorting

    // Options for the tour statuses
    const statusOptions = [
        { label: 'All', value: 'ALL' },
        { label: 'Waiting', value: 'WAITING' },
        { label: 'Approved', value: 'APPROVED' },
        { label: 'Rejected', value: 'REJECTED' },
        { label: 'Cancelled', value: 'CANCELLED' },
        { label: 'Done', value: 'DONE' },
    ];

    useEffect(() => {
        const fetchTours = async () => {
            try {
                const data = await getAllTours();

                // Debugging: Log the fetched data to verify 'credit_score' presence
                console.log("Fetched Tours Data:", data);

                // Override statuses for display
                const processedTours = data.map((tour) => {
                    if (["READY", "DONE"].includes(tour.tour_status)) {
                        return { ...tour, display_status: "APPROVED" };
                    }
                    return { ...tour, display_status: tour.tour_status };
                });

                setTours(processedTours);

                // Dynamically calculate rows to fit the screen
                const availableHeight = window.innerHeight;
                const rowHeight = 60;
                const headerHeight = 100;
                const footerHeight = 80;
                const rowsToFit = Math.floor((availableHeight - headerHeight - footerHeight) / rowHeight);
                setRows(rowsToFit);
            } catch (error) {
                console.error("Error loading tours:", error);
            }
        };

        fetchTours();
    }, []);

    const handleApprove = async (rowData) => {
        const selectedTime = selectedTimes[rowData.tour_id];
        const tourDate = rowData.date;

        if (!selectedTime) {
            alert("Please select a time preference!");
            return;
        }

        try {
            await approveTour(rowData.tour_id, selectedTime, tourDate);
            setTours((prevTours) =>
                prevTours.map((tour) =>
                    tour.tour_id === rowData.tour_id
                        ? { ...tour, time: selectedTime, tour_status: "APPROVED", display_status: "APPROVED" }
                        : tour
                )
            );
        } catch (error) {
            console.error("Error approving tour:", error);
        }
    };

    const handleReject = async (rowData) => {
        try {
            await rejectTour(rowData.tour_id);
            setTours((prevTours) =>
                prevTours.map((tour) =>
                    tour.tour_id === rowData.tour_id
                        ? { ...tour, tour_status: "REJECTED", display_status: "REJECTED" }
                        : tour
                )
            );
        } catch (error) {
            console.error("Error rejecting tour:", error);
        }
    };

    const dateBodyTemplate = (rowData) => {
        const date = new Date(rowData.date);
        const formattedDate = `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
        return (
            <span>
                {formattedDate} ({rowData.day})
            </span>
        );
    };

    const notesBodyTemplate = (rowData) => {
        if (rowData.visitor_notes) {
            return (
                <Button
                    icon="pi pi-file"
                    className="p-button-info"
                    onClick={() => {
                        setCurrentNote(rowData.visitor_notes);
                        setDialogVisible(true);
                    }}
                />
            );
        }
        return <span>No notes</span>;
    };

    // Helper function to compare credit scores
    const compareCreditScore = (a, b) => {
        const creditA = parseFloat(a.credit_score);
        const creditB = parseFloat(b.credit_score);

        const isCreditAValid = !isNaN(creditA);
        const isCreditBValid = !isNaN(creditB);

        if (isCreditAValid && isCreditBValid) {
            return creditB - creditA; // Descending order
        }
        if (isCreditAValid) {
            return -1; // a comes before b
        }
        if (isCreditBValid) {
            return 1; // b comes before a
        }
        return 0; // No change
    };

    // Updated creditBodyTemplate to handle non-numeric 'credit_score'
    const creditBodyTemplate = (rowData) => {
        const credit = parseFloat(rowData.credit_score);

        // Debugging: Log the credit value and type
        console.log(`Credit Score for Tour ID ${rowData.tour_id}:`, rowData.credit_score, typeof rowData.credit_score);

        if (!isNaN(credit)) {
            return <span>{credit.toFixed(2)}</span>;
        }

        return <span>N/A</span>;
    };

    const actionBodyTemplate = (rowData) => {
        if (rowData.tour_status !== "WAITING") {
            return <span>Action not available</span>;
        }

        const timeOptions = [
            rowData.timepref1,
            rowData.timepref2,
            rowData.timepref3,
            rowData.timepref4,
        ].filter((time) => time !== null);

        return (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <Dropdown
                    value={selectedTimes[rowData.tour_id]}
                    options={timeOptions}
                    onChange={(e) =>
                        setSelectedTimes((prev) => ({
                            ...prev,
                            [rowData.tour_id]: e.value,
                        }))
                    }
                    placeholder="Select Time"
                    className="p-mb-2"
                    disabled={rowData.tour_status !== "WAITING"}
                />
                <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                    <Button
                        label="Approve"
                        className="p-button-success"
                        onClick={() => handleApprove(rowData)}
                        disabled={rowData.tour_status !== "WAITING"}
                    />
                    <Button
                        label="Reject"
                        className="p-button-danger"
                        onClick={() => handleReject(rowData)}
                        disabled={rowData.tour_status !== "WAITING"}
                    />
                </div>
            </div>
        );
    };

    const rowClassName = (rowData) => {
        switch (rowData.display_status) {
            case "APPROVED":
                return "green-row";
            case "WAITING":
                return "yellow-row";
            case "REJECTED":
            case "CANCELLED": // Use the same style as REJECTED
                return "red-row";
            default:
                return "";
        }
    };

    // Filter the tours based on the selected status
    const filteredTours = tours.filter((tour) => {
        if (filterStatus === 'ALL') {
            return true;
        }
        return tour.display_status === filterStatus;
    });

    // Sorting logic with prioritized sorting
    const sortedTours = [...filteredTours].sort((a, b) => {
        if (sortAsPrioritized) {
            if (sortOrder === 'asc' || sortOrder === 'desc') {
                // Primary sort by date
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                if (dateA < dateB) return sortOrder === 'asc' ? -1 : 1;
                if (dateA > dateB) return sortOrder === 'asc' ? 1 : -1;
                // Secondary sort by credit_score descending
                return compareCreditScore(a, b);
            } else {
                // No date sorting, sort solely by credit_score descending
                return compareCreditScore(a, b);
            }
        } else {
            // Original sorting behavior
            if (sortOrder === 'asc') {
                return new Date(a.date) - new Date(b.date);
            } else if (sortOrder === 'desc') {
                return new Date(b.date) - new Date(a.date);
            }
            return 0; // No sorting
        }
    });

    return (
        <div className="tour-approval-table-container">
            <h1 style={{ textAlign: "center", margin: "40px 0" }}>Tour Approval Page</h1>
            <div style={{marginLeft: "65px", textAlign: "center", justifyContent: "center", alignItems: "center"}}>
                <div
                    className="filter-sort-container"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        flexWrap: "wrap", // Optional: Handle responsiveness
                        width: "94%", // Optional: Adjust width as needed
                    }}
                >
                    {/* Left-aligned filter and sort controls */}
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <FilterByStatus
                            filterStatus={filterStatus}
                            setFilterStatus={setFilterStatus}
                            statusOptions={statusOptions}
                        />
                        <SortByDate
                            sortOrder={sortOrder}
                            setSortOrder={setSortOrder}
                        />
                    </div>

                    {/* Right-aligned Sort as Prioritized Toggle Button */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginLeft: "auto",
                        }}
                    >
                        <span>Sort as Prioritized</span>
                        <ToggleButton
                            checked={sortAsPrioritized}
                            onChange={(e) => setSortAsPrioritized(e.value)}
                            onLabel="On"
                            offLabel="Off"
                            aria-label="Sort as Prioritized"
                            tooltip="Enable prioritized sorting based on credit scores"
                            tooltipOptions={{ position: 'top' }}
                        />
                    </div>
                    {/* Future filtering and sorting controls can be added here */}
                </div>
            </div>
            
            {/* DataTable using sortedTours */}
            <DataTable
                value={sortedTours}
                paginator
                rows={rows}
                tableStyle={{ minWidth: '90rem' }} // Increased minWidth to accommodate the new column
                paginatorTemplate="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                currentPageReportTemplate="{first} to {last} of {totalRecords}"
                rowClassName={rowClassName}
            >
                {/* Columns */}
                <Column field="tour_id" header="Tour ID" style={{ width: '5%' }}></Column>
                <Column field="display_status" header="Tour Status" style={{ width: '10%' }}></Column>
                <Column field="school_name" header="School Name" style={{ width: '20%' }}></Column>
                <Column field="city" header="City" style={{ width: '10%' }}></Column>
                <Column header="Date (Day)" body={dateBodyTemplate} style={{ width: '10%' }}></Column>

                {/* New Credit Score Column */}
                <Column header="Credit Score" body={creditBodyTemplate} style={{ width: '10%' }}></Column>

                <Column field="tour_size" header="Tour Size" style={{ width: '5%' }}></Column>
                <Column field="teacher_name" header="Teacher Name" style={{ width: '10%' }}></Column>
                <Column field="teacher_phone" header="Teacher Phone" style={{ width: '10%' }}></Column>
                <Column field="time" header="Selected Time" style={{ width: '5%' }}></Column>
                <Column header="Notes" body={notesBodyTemplate} style={{ width: '10%' }}></Column>
                <Column header="Approve/Reject" body={actionBodyTemplate} style={{ width: '10%' }}></Column>
            </DataTable>

            {/* Dialog for Notes */}
            <Dialog
                visible={dialogVisible}
                onHide={() => setDialogVisible(false)}
                header="Visitor Notes"
                footer={
                    <Button
                        label="Close"
                        icon="pi pi-times"
                        onClick={() => setDialogVisible(false)}
                    />
                }
            >
                <p>{currentNote}</p>
            </Dialog>
            <div>

            </div>
            {/* 📌 Suggestion Note */}
            <div
                style={{
                    margin: "20px",
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    backgroundColor: "#f9f9f9",
                }}
            >
            <p style={{ fontSize: "14px", color: "#333" }}>
                If you want to assign the most appropriate days according to the most suitable schools based on prioritization, follow these steps:
                <br /><br />
                1. Filter by <strong>WAITING</strong> status. 🕒
                <br />
                2. Sort by Date in <strong>'Ascending'</strong> or <strong>'Descending'</strong> order (Ascending is preferred). 📅
                <br />
                3. Enable "Sort as Prioritized". ✅
                <br /><br />
                This way, you'll see the waiting tour applications in ascending date order. For tours on the same date, you can prioritize schools according to their <strong>Credit Score</strong>. 
                <br /><br />
                In case of conflicts, assign the tour hour to the school with the highest credit score. 🏆😊
            </p>
            </div>
        </div>
    );

};

export default TourApprovalTable;
