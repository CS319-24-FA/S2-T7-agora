import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import AssignTourService from "../../services/AssignTourService";
import { fetchFairs, unassignGuide } from "../../services/fairService";
import "./MyTours.css";
import Sidebar from '../../components/common/Sidebar';

export default function MyTours() {
    const [items, setItems] = useState([]); // Combined data of tours and fairs
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch tours
                const tours = await AssignTourService.getMyTours();

                // Fetch assigned fairs for the user
                const fairs = await fetchFairs(); // You might filter assigned fairs based on the user

                // Combine and format data
                const combinedData = [
                    ...tours.map((tour) => ({
                        ...tour,
                        type: "tour", // Mark as a tour
                        event: tour.school_name, // Event for tour is the school name
                    })),
                    ...fairs
                        .filter((fair) => [fair.guide_1_id, fair.guide_2_id, fair.guide_3_id].includes(parseInt(localStorage.getItem("userId")))) // Filter assigned fairs
                        .map((fair) => ({
                            ...fair,
                            type: "fair", // Mark as a fair
                            event: fair.organization_name, // Event for fair is the organization name
                        })),
                ];

                setItems(combinedData);
            } catch (err) {
                setError(err.message || "Failed to fetch data");
            }
        };

        fetchData();
    }, []);

    const dateTemplate = (rowData) => new Date(rowData.date).toLocaleDateString();
    const dayTemplate = (rowData) => {
        const date = new Date(rowData.date);
        return date.toLocaleString("en-us", { weekday: "long" });
    };

    const timeTemplate = (rowData) => (rowData.type === "tour" ? rowData.time || "Not Assigned" : "-");

    const handleWithdraw = async (item) => {
        const isFair = item.type === "fair";

        if (window.confirm(`Are you sure you want to withdraw from this ${isFair ? "fair" : "tour"}?`)) {
            try {
                if (isFair) {
                    // Unassign from fair
                    const userId = parseInt(localStorage.getItem("userId"));
                    const column =
                        item.guide_1_id === userId
                            ? "guide_1_id"
                            : item.guide_2_id === userId
                            ? "guide_2_id"
                            : "guide_3_id";

                    await unassignGuide(item.id, column);
                } else {
                    // Withdraw from tour
                    await AssignTourService.withdrawFromTour(item.id);
                }

                // Update the UI
                setItems((prevItems) => prevItems.filter((i) => i.id !== item.id));
            } catch (error) {
                console.error(`Failed to withdraw from ${isFair ? "fair" : "tour"}:`, error);
                setError(error.message || `Failed to withdraw from ${isFair ? "fair" : "tour"}`);
            }
        }
    };

    const actionTemplate = (rowData) => (
        <button
            className="withdraw-button"
            onClick={() => handleWithdraw(rowData)}
        >
            Withdraw
        </button>
    );

    return (
        <div className="my-tours-container">
            <Sidebar />
            <div className="my-tours-content">
            <h1>My Assignments</h1>
            {error && <p className="error-message">{error}</p>}
            <DataTable value={items} paginator rows={10}>
                <Column field="date" header="Date" body={dateTemplate}></Column>
                <Column field="date" header="Day" body={dayTemplate}></Column>
                <Column field="event" header="Event"></Column>
                <Column field="time" header="Time" body={timeTemplate}></Column>
                <Column body={actionTemplate} header="Actions"></Column>
            </DataTable>
        </div>
        </div>
    );
}
