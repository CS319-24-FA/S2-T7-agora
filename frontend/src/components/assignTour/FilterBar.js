import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import "./FilterBar.css";

export default function FilterBar({ onFilterChange }) {
  const [filters, setFilters] = useState({
    date: null,
    day: "",
    time: "",
    school: "",
    city: "",
    guide: "",
  });

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const handleFilterChange = (field, value) => {
    const updatedFilters = { ...filters, [field]: value };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      date: null,
      day: "",
      time: "",
      school: "",
      city: "",
      guide: "",
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div className="filter-bar-container">
      {/* Date Filter */}
      <div className="filter-row">
        <Calendar
          value={filters.date}
          onChange={(e) => handleFilterChange("date", e.value)}
          placeholder="Select Date"
          className="filter-input"
        />

        {/* Day Filter */}
        <Dropdown
          value={filters.day}
          options={daysOfWeek.map((day) => ({ label: day, value: day }))}
          onChange={(e) => handleFilterChange("day", e.value)}
          placeholder="Select Day"
          className="filter-input"
        />

        {/* Time Filter */}
        <InputText
          value={filters.time}
          onChange={(e) => handleFilterChange("time", e.target.value)}
          placeholder="Enter Time"
          className="filter-input"
        />
      </div>
      
      <div className="filter-row">
        <InputText
          value={filters.school}
          onChange={(e) => handleFilterChange("school", e.target.value)}
          placeholder="Enter School"
          className="filter-input"
        />

        {/* City Filter */}
        <InputText
          value={filters.city}
          onChange={(e) => handleFilterChange("city", e.target.value)}
          placeholder="Enter City"
          className="filter-input"
        />

        {/* Guide Filter */}
        <InputText
          value={filters.guide}
          onChange={(e) => handleFilterChange("guide", e.target.value)}
          placeholder="Enter Guide Name"
          className="filter-input"
        />
      </div>
      {/* School Filter */}

      {/* Clear Filters Button */}
      <Button
        label="Clear Filters"
        onClick={clearFilters}
        className="p-button-outlined p-button-danger"
      />
    </div>
  );
}
