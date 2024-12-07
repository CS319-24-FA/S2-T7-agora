import React, { useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

const DropdownOrText = ({ row, column, guideNameField, guides, handleAssignGuide, handleUnassignGuide, loadGuides, disabled }) => {
    const [showUnassign, setShowUnassign] = useState(false); // Manage unassign button visibility

    const handleUnassignClick = async () => {
        await handleUnassignGuide(row.id, column);
        setShowUnassign(false); // Hide the unassign button after the action
    };

    const assignedGuideName = row[guideNameField];

    return assignedGuideName ? (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "5px", // Small gap between name and button
            }}
        >
            <span
                style={{ cursor: "pointer" }}
                onClick={() => setShowUnassign(!showUnassign)} // Toggle button visibility on click
                title="Click to manage guide"
            >
                {assignedGuideName}
            </span>
            {showUnassign && (
                <Button
                    icon="pi pi-times"
                    className="p-button-rounded p-button-danger p-button-sm" // Small and rounded button
                    onClick={handleUnassignClick}
                    tooltip="Unassign Guide"
                    style={{
                        width: "24px", // Set width for square
                        height: "24px", // Set height for square
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0", // Remove extra padding
                        fontSize: "14px", // Adjust font size for icon
                    }}
                />
            )}
        </div>
    ) : (
        <Dropdown
            value={row[column]}
            options={guides[row.id] || []}
            optionLabel="full_name"
            optionValue="id"
            placeholder="Select Guide"
            onFocus={() => loadGuides(row.id)}
            onChange={(e) => handleAssignGuide(row.id, column, e.value)}
            disabled={disabled} // Disable dropdown if the fair is cancelled
        />
    );
};

export default DropdownOrText;
