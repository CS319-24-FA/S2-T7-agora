import React, { useState, useRef } from "react";
import { addWork } from "../../services/WorkService";
import { Toast } from "primereact/toast"; // Toast
import { InputNumber } from "primereact/inputnumber"; // InputNumber
import { Dropdown } from "primereact/dropdown"; // Dropdown
import { Calendar } from "primereact/calendar"; // Calendar

function AddWork({ refreshData }) {
    const workTypes = [
        { name: "Interview", code: "INTERVIEW" },
        { name: "Information Booth", code: "INFO_BOOTH" },
    ];

    const [selectedWorkType, setSelectedWorkType] = useState(null); // Dropdown selection
    const [dateTime, setDateTime] = useState(null); // Calendar value
    const [workTime, setWorkTime] = useState(0); // Time in hours with step of 0.5
    const toast = useRef(null); // Toast ref

    const getDayOfWeek = (date) => {
        const days = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ];
        return days[date.getDay()];
    };

    const handleAddWork = async () => {
        if (toast.current) toast.current.clear(); // Clear toast before showing a new one

        if (!selectedWorkType || !dateTime || workTime === 0) {
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Please fill all the fields!",
                life: 3000,
            });
            return;
        }

        // Adjust for local timezone
        const localDate = new Date(dateTime);
        const date = localDate.toLocaleDateString("en-CA"); // Format: YYYY-MM-DD
        const time = localDate.toLocaleTimeString("en-GB").slice(0, 5); // Format: HH:mm
        const day = getDayOfWeek(localDate);
        const workload = workTime * 60;
        const userId = localStorage.getItem("userId");
        //console.log(localDate, time);

        const newWork = {
            type: selectedWorkType.name,
            date,
            time,
            day,
            user_id: userId,
            workload,
            is_approved: false,
        };

        try {
            await addWork(newWork);
            if (toast.current) toast.current.clear();
            toast.current.show({
                severity: "success",
                summary: "Success",
                detail: "Work added successfully!",
                life: 3000,
            });
            refreshData();
        } catch (error) {
            console.error("Error adding work:", error);
            if (toast.current) {
                toast.current.clear();
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Failed to add work.",
                    life: 3000,
                });
            }
        }
    };

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                flexWrap: "nowrap", // Prevent wrapping
            }}
        >
            <Toast ref={toast} /> {/* Toast for AddWork */}
            {/* Work Type Dropdown */}
            <Dropdown
                value={selectedWorkType}
                options={workTypes}
                onChange={(e) => setSelectedWorkType(e.value)}
                optionLabel="name"
                placeholder="Select a Work Type"
                style={{
                    width: "10rem",
                    height: "3rem",
                    fontSize: "1rem",
                    borderRadius: "5px",
                    flexShrink: 0,
                }}
            />
            {/* Date-Time Input */}
            <input
                type="datetime-local"
                value={
                    dateTime
                        ? new Date(dateTime.getTime() - dateTime.getTimezoneOffset() * 60000)
                            .toISOString()
                            .slice(0, 16) // Adjust to local time
                        : ''
                }
                onChange={(e) => setDateTime(new Date(e.target.value))} // Store in local time
                max={new Date().toISOString().slice(0, 16)} // Restrict max date to now
                placeholder="Select Date & Time"
                style={{
                    height: "3rem",
                    fontSize: "1rem",
                    borderRadius: "5px",
                    padding: "0.5rem",
                    border: "1px solid #ccc",
                    flexShrink: 0,
                }}
            />

            {/* InputNumber for Work Time */}
            <InputNumber
                id="work-time"
                value={workTime}
                onValueChange={(e) => setWorkTime(e.value)}
                showButtons
                buttonLayout="horizontal"
                step={0.5} // Step by 0.5 hours (30 minutes)
                min={0} // Minimum value
                max={10} // Maximum value
                decrementButtonClassName="p-button-danger"
                incrementButtonClassName="p-button-success"
                incrementButtonIcon="pi pi-plus"
                decrementButtonIcon="pi pi-minus"
                suffix=" hours" // Display 'hours' suffix
                style={{
                    height: "3rem",
                    fontSize: "1rem",
                    borderRadius: "5px",
                    flexShrink: 0,
                }}
                inputStyle={{ pointerEvents: "none" }} // Prevent manual typing
                inputRef={(ref) => ref && (ref.readOnly = true)} // Programmatically make input read-only
            />
            {/* Add Work Button */}
            <button
                onClick={handleAddWork}
                style={{
                    height: "3rem",
                    padding: "0 1rem",
                    fontSize: "1rem",
                    borderRadius: "5px",
                    backgroundColor: "#004a77",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background-color 0.3s ease",
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#003355")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#004a77")}
            >
                <i className="pi pi-plus" style={{ marginRight: "0.5rem" }}></i>
                Add Work
            </button>
        </div>
    );
}

export default AddWork;
