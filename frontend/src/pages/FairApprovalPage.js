import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog"; // Use Dialog instead of window.confirm
import { Toast } from "primereact/toast"; // (2) Importing Toast
import { fetchFairs, fetchAvailableGuides, assignGuide, approveFair, cancelFair, unassignGuide, addFairGuide, removeFairGuide } from "../services/fairService";
import DropdownOrText from '../components/fair/DropdownOrText';
import Sidebar from '../components/common/Sidebar';
import "./FairApproval.css";
import Unauthorized from './Unauthorized'; // Import the Unauthorized component
import useProtectRoute from '../hooks/useProtectRoute';
import FilterBar from "../components/fair/FilterBar"; // Import the FilterBar component

export default function FairApprovalPage() {
    const isAuthorized = useProtectRoute([4]); // Check authorization
    const [fairs, setFairs] = useState([]);
    const [guides, setGuides] = useState({});
    const [filteredFairs, setFilteredFairs] = useState([]); // For filtered data
    const toast = useRef(null); // (3) Toast ref

    const [confirmVisible, setConfirmVisible] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState("");

    useEffect(() => {
        fetchFairs()
            .then((data) => {
                const sortedFairs = data.sort((a, b) => new Date(a.date) - new Date(b.date));
                setFairs(sortedFairs);
                setFilteredFairs(sortedFairs); // Initialize filtered data
                // Show success toast after data loaded
                toast.current.clear(); // (4) Clear before showing toast
                toast.current.show({
                    severity: "success",
                    summary: "Success",
                    detail: "Fairs loaded successfully.",
                    life: 3000,
                });
            })
            .catch((error) => {
                console.error("Error fetching fairs:", error);
                toast.current.clear();
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Failed to load fairs. Please try again.",
                    life: 3000,
                });
            });
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    };



    const rowClassName = (rowData) => {
        if (rowData.status === "CANCELLED") {
            return "cancelled-row"; // Apply CSS class for cancelled rows
        }
        if (rowData.status === "DONE") {
            return "done-row"; // Apply CSS class for done rows
        }
        return ""; // Default case, no specific class
    };

    const loadGuides = async (fairId) => {
        if (!guides[fairId]) {
            try {
                const availableGuides = await fetchAvailableGuides(fairId);
                const fair = fairs.find((f) => f.id === fairId);
                const assignedGuideIds = [
                    fair.guide_1_id,
                    fair.guide_2_id,
                    fair.guide_3_id,
                ].filter((id) => id);

                const filteredGuides = availableGuides.filter(
                    (guide) => !assignedGuideIds.includes(guide.id)
                );
                setGuides((prev) => ({ ...prev, [fairId]: filteredGuides }));
            } catch (error) {
                console.error("Error fetching available guides for fair:", fairId, error);
                toast.current.clear();
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Failed to load guides for this fair.",
                    life: 3000,
                });
            }
        }
    };

    const handleFilterChange = (filters) => {
        let filtered = [...fairs];

        if (filters.date) {
            filtered = filtered.filter(
                (fair) =>
                    new Date(fair.date).toLocaleDateString() ===
                    new Date(filters.date).toLocaleDateString()
            );
        }

        if (filters.organization) {
            filtered = filtered.filter((fair) =>
                fair.organization_name.toLowerCase().includes(filters.organization.toLowerCase())
            );
        }

        if (filters.status) {
            filtered = filtered.filter((fair) => fair.status === filters.status);
        }

        setFilteredFairs(filtered);
    };

    const handleAssignGuide = async (fairId, column, guideId) => {
        if (!guideId) {
            toast.current.clear();
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Guide ID is required for assignment.",
                life: 3000,
            });
            return;
        }
        try {
            await assignGuide(fairId, column, guideId);
            await addFairGuide(fairId, guideId);
            const assignedGuide = guides[fairId]?.find((guide) => guide.id === guideId);
            if (assignedGuide) {
                setFairs((prevFairs) =>
                    prevFairs.map((fair) =>
                        fair.id === fairId
                            ? {
                                ...fair,
                                [column]: guideId,
                                [`${column.replace("_id", "_name")}`]: assignedGuide.full_name,
                            }
                            : fair
                    )
                );

                await loadGuides(fairId);

                toast.current.clear();
                toast.current.show({
                    severity: "success",
                    summary: "Success",
                    detail: "Guide assigned successfully.",
                    life: 3000,
                });
            } else {
                console.error("Assigned guide details not found");
                toast.current.clear();
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Assigned guide details not found.",
                    life: 3000,
                });
            }
        } catch (error) {
            console.error("Error assigning guide:", error);
            toast.current.clear();
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Failed to assign guide. Please try again.",
                life: 3000,
            });
        }
    };

    const confirmDialogFooter = (
        <div>
            <Button
                label="No"
                icon="pi pi-times"
                onClick={() => setConfirmVisible(false)}
                className="p-button-text"
            />
            <Button
                label="Yes"
                icon="pi pi-check"
                onClick={async () => {
                    setConfirmVisible(false);
                    if (confirmAction) {
                        await confirmAction();
                    }
                }}
                className="p-button-danger"
                autoFocus
            />
        </div>
    );

    const handleApproveFair = (fairId) => {
        setConfirmMessage("Are you sure you want to approve this fair?");
        setConfirmAction(() => async () => {
            try {
                const result = await approveFair(fairId);
                toast.current.clear();
                toast.current.show({
                    severity: "success",
                    summary: "Success",
                    detail: result.message || "Fair approved successfully.",
                    life: 3000,
                });
                setFairs((prevFairs) =>
                    prevFairs.map((fair) =>
                        fair.id === fairId ? { ...fair, status: 'APPROVED' } : fair
                    )
                );
            } catch (error) {
                console.error('Error approving fair:', error);
                toast.current.clear();
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Failed to approve the fair.",
                    life: 3000,
                });
            }
        });
        setConfirmVisible(true);
    };

    const handleCancelFair = (fairId) => {
        setConfirmMessage("Are you sure you want to cancel this fair?");
        setConfirmAction(() => async () => {
            try {
                const result = await cancelFair(fairId);
                toast.current.clear();
                toast.current.show({
                    severity: "success",
                    summary: "Success",
                    detail: result.message || "Fair cancelled successfully.",
                    life: 3000,
                });
                setFairs((prevFairs) =>
                    prevFairs.map((fair) =>
                        fair.id === fairId ? { ...fair, status: 'CANCELLED' } : fair
                    )
                );
            } catch (error) {
                console.error('Error cancelling fair:', error);
                toast.current.clear();
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Failed to cancel the fair.",
                    life: 3000,
                });
            }
        });
        setConfirmVisible(true);
    };

    const handleUnassignGuide = (fairId, column) => {
        console.log(column);
        setConfirmMessage("Are you sure you want to unassign this guide?");
        setConfirmAction(() => async () => {
            try {
                await removeFairGuide(fairId, column);
                const result = await unassignGuide(fairId, column);
                toast.current.clear();
                toast.current.show({
                    severity: "success",
                    summary: "Success",
                    detail: result.message || "Guide unassigned successfully.",
                    life: 3000,
                });
                setFairs((prevFairs) =>
                    prevFairs.map((fair) =>
                        fair.id === fairId
                            ? {
                                ...fair,
                                [column]: null,
                                [`${column.replace("_id", "_name")}`]: null,
                            }
                            : fair
                    )
                );
            } catch (error) {
                console.error("Error unassigning guide:", error);
                toast.current.clear();
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Failed to unassign guide.",
                    life: 3000,
                });
            }
        });
        setConfirmVisible(true);
    };

    const actionButtonsTemplate = (rowData) => (
        <div style={{ display: 'flex', gap: '10px' }}>
            <Button
                label="Approve"
                icon="pi pi-check"
                className="fair-approve-button"
                onClick={() => handleApproveFair(rowData.id)}
                disabled={rowData.status !== 'WAITING'}
            />
            <Button
                label="Cancel"
                icon="pi pi-times"
                className="fair-cancel-button"
                onClick={() => handleCancelFair(rowData.id)}
                disabled={rowData.status === 'CANCELLED' || rowData.status === 'DONE'}
            />
        </div>
    );
    if (!isAuthorized) {
        return <Unauthorized />;
    }
    return (
        <div className="fair-approval-page">
            <Sidebar />
            <Toast ref={toast} /> {/* (5) Adding Toast component to JSX */}
            <div className="fair-approval-content">
                <h2>Fair Approval</h2>
                <FilterBar onFilterChange={handleFilterChange} />

                <DataTable
                    value={filteredFairs} // Use filtered data
                    paginator
                    rows={15}
                    responsiveLayout="scroll"
                    rowClassName={rowClassName}
                >
                    <Column
                        field="date"
                        header="Date"
                        body={(rowData) => formatDate(rowData.date)}
                    />
                    <Column field="organization_name" header="Organization" />
                    <Column field="city" header="City" />
                    {["guide_1_id", "guide_2_id", "guide_3_id"].map((column, index) => (
                        <Column
                            key={column}
                            header={`Guide ${index + 1}`}
                            body={(rowData) => (
                                <DropdownOrText
                                    row={rowData}
                                    column={column}
                                    guideNameField={`${column.replace("_id", "_name")}`}
                                    guides={guides}
                                    handleAssignGuide={handleAssignGuide}
                                    handleUnassignGuide={handleUnassignGuide}
                                    loadGuides={loadGuides}
                                    disabled={rowData.status === "CANCELLED" || rowData.status === "WAITING"}
                                />
                            )}
                        />
                    ))}
                    <Column body={actionButtonsTemplate} header="Actions" />
                </DataTable>
            </div>

            {/* Confirmation Dialog */}
            <Dialog
                visible={confirmVisible}
                onHide={() => setConfirmVisible(false)}
                header="Confirmation"
                footer={confirmDialogFooter}
                modal
                closable={false}
            >
                <p>{confirmMessage}</p>
            </Dialog>
        </div>
    );
}
