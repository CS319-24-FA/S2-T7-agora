// src/components/FilterByStatus.jsx
import React from "react";
import { Dropdown } from "primereact/dropdown";
import PropTypes from "prop-types";
import "./FilterByStatus.css"; // Import the CSS for this component

const FilterByStatus = ({ filterStatus, setFilterStatus, statusOptions }) => {
    return (
        <div className="filter-by-status">
            <span className="filter-label">Filter by Status:</span>
            <Dropdown
                value={filterStatus}
                options={statusOptions}
                onChange={(e) => setFilterStatus(e.value)}
                placeholder="Select Status"
                className="p-mr-2"
                style={{ minWidth: "200px" }}
            />
            {/* Future filtering and sorting controls can be added here */}
        </div>
    );
};

FilterByStatus.propTypes = {
    filterStatus: PropTypes.string.isRequired,
    setFilterStatus: PropTypes.func.isRequired,
    statusOptions: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            value: PropTypes.string.isRequired,
        })
    ).isRequired,
};

export default FilterByStatus;
