import IndividualTourTable from "../components/individualTours/IndividualTourTable"
import Sidebar from '../components/common/Sidebar'; 

function IndividualTourPage() {
    return (
        <div className="individual-tour-page">
            <Sidebar />
            <div className="individual-tour-content">
                <IndividualTourTable />
            </div>
        </div>
    );
}
export default IndividualTourPage