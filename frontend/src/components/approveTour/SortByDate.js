// src/components/SortByDate.jsx
import React from "react";
import { Dropdown } from "primereact/dropdown";
import PropTypes from "prop-types";
import "./SortByDate.css"; // Import the CSS for this component

const SortByDate = ({ sortOrder, setSortOrder }) => {
    const sortOptions = [
        { label: 'None', value: 'none' },
        { label: 'Date Ascending', value: 'asc' },
        { label: 'Date Descending', value: 'desc' },
    ];

    return (
        <div className="sort-by-date">
            <span className="sort-label">Sort by Date:</span>
            <Dropdown
                value={sortOrder}
                options={sortOptions}
                onChange={(e) => setSortOrder(e.value)}
                placeholder="Select Sort Order"
                className="p-mr-2"
                style={{ minWidth: "200px" }}
            />
            {/* Future sorting controls can be added here */}
        </div>
    );
};

SortByDate.propTypes = {
    sortOrder: PropTypes.string.isRequired,
    setSortOrder: PropTypes.func.isRequired,
};

export default SortByDate;
