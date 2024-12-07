import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { cancelTour } from "../services/ApproveTourService"; // Import the service function
import Sidebar from '../components/common/Sidebar';

const CancelConfirmation = () => {
    const [searchParams] = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);

    // Extract the token from the URL
    const token = searchParams.get("token");

    const handleCancel = async () => {
        if (!token) {
            setMessage("Invalid cancellation link.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await cancelTour(token); // Call the service function
            setMessage(response.message || "Tour successfully canceled.");
        } catch (error) {
            setMessage(
                error.response?.data?.message || "Failed to cancel the tour. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <Sidebar />
            <h1>Confirm Cancellation</h1>
            <p>Are you sure you want to cancel your tour?</p>

            {message ? (
                <p style={{ color: message.includes("successfully") ? "green" : "red" }}>
                    {message}
                </p>
            ) : (
                <>
                    <button
                        onClick={handleCancel}
                        disabled={isLoading}
                        style={{
                            padding: "10px 20px",
                            fontSize: "16px",
                            backgroundColor: "#ff4d4f",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                        }}
                    >
                        {isLoading ? "Processing..." : "Yes, Cancel My Tour"}
                    </button>
                </>
            )}
        </div>
    );
};

export default CancelConfirmation;
