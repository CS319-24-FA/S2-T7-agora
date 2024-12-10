import TourApprovalTable from "../components/approveTour/TourApprovalTable"
import Sidebar from '../components/common/Sidebar'; 
import "./TourApproval.css"; // Create a CSS file for additional styling, if necessary

function TourApprovalPage() {
    return (
        <div className="tour-approval-page">
            {/* Sidebar Section */}
            <div className="sidebar-container">
                <Sidebar />
            </div>
            {/* Main Content Section */}
            <div className="main-content-container">
                <TourApprovalTable />
            </div>
        </div>
    );
}
export default TourApprovalPage