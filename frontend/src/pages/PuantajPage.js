import React, { useEffect, useState } from "react";
import Sidebar from "../components/common/Sidebar";
import AdminWorkTable from "../components/puantajpage/AdminWorkTable";
import UserWorkTable from "../components/puantajpage/UserWorkTable";

function PuantajPage() {
    const [userType, setUserType] = useState(null);

    useEffect(() => {
        // Retrieve userType from localStorage or other state management
        const storedUserType = parseInt(localStorage.getItem("userType"), 10);
        setUserType(storedUserType);
    }, []);

    return (
        <div className="puantaj-page">
            <Sidebar />
            <div className="puantaj-content">
                {userType === 4 ? <AdminWorkTable /> : <UserWorkTable />}
                <div className="submit-button-container">
                  
                </div>
            </div>
        </div>
    );
}

export default PuantajPage;
