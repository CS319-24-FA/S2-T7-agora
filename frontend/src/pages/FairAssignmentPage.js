import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { fetchFairs, requestToJoinFair } from "../services/fairService";
import Sidebar from '../components/common/Sidebar';
import "./FairAssignment.css";

export default function FairAssignmentPage() {
    const [fairs, setFairs] = useState([]);

    // Fetch approved fairs on component load
    useEffect(() => {
        const loadApprovedFairs = async () => {
            try {
                const data = await fetchFairs("APPROVED");
                setFairs(data);
            } catch (error) {
                console.error("Error loading approved fairs:", error);
            }
        };

        loadApprovedFairs();
    }, []);

    // Handle guide request to join a fair
    const handleRequestToJoin = async (fairId) => {
        const guideId = localStorage.getItem("userId");
        if (!guideId) {
            console.error("Guide ID is missing");
            return;
        }

        if (window.confirm("Are you sure you want to send a request to join this fair?")) {
            try {
                await requestToJoinFair(fairId, guideId); // Send request to backend
                setFairs((prevFairs) =>
                    prevFairs.map((f) => (f.id === fairId ? { ...f, requested: true } : f))
                );
                alert("Request sent successfully!"); // Optional success message
            } catch (error) {
                console.error("Error sending join request:", error);
            }
        }
    };

    const actionTemplate = (rowData) => (
        <Button
            label="Request to Join"
            icon="pi pi-send"
            onClick={() => handleRequestToJoin(rowData.id)}
            disabled={rowData.requested} // Disable if already requested
        />
    );

    return (
        <div className="fair-assignment-page">
            {/* Sidebar */}
            <Sidebar />
    
            {/* Main Content */}
            <div className="fair-assignment-content">
                <h2>Fair Assignment</h2>
                <DataTable value={fairs} paginator rows={10} responsiveLayout="scroll">
                    <Column field="date" header="Date" />
                    <Column field="organization_name" header="Organization Name" />
                    <Column field="city" header="City" />
                    <Column body={actionTemplate} header="Actions" />
                </DataTable>
            </div>
        </div>
    );
    
}
