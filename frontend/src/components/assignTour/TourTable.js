import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { formatDate } from "../common/dateUtils";
import { MultiSelect } from "primereact/multiselect";
import AssignTourService from "../../services/AssignTourService";
import "./ReadyToursTable.css";
import io from "socket.io-client";
import FilterBar from "./FilterBar"; // Import the FilterBar component
const userType = parseInt(localStorage.getItem("userType"), 10);

const socket = io("http://localhost:3001");

export default function ReadyToursTable() {
  const [tours, setTours] = useState([]);
  const [filteredTours, setFilteredTours] = useState([]); // State to store filtered tours
  const [message, setMessage] = useState(null);
  const [expandedRows, setExpandedRows] = useState(null); // For expandable rows
  const [selectedCandidates, setSelectedCandidates] = useState({}); // Tracks MultiSelect values
  const [candidateGuideOptions, setCandidateGuideOptions] = useState([]); // Dropdown options
  const [classroomInputs, setClassroomInputs] = useState({}); // State to track classroom inputs per row


  useEffect(() => {
    const fetchTours = async () => {
      try {
        const data = await AssignTourService.getReadyTours();
        setTours(data);
        setFilteredTours(data); // Initialize filtered tours
      } catch (error) {
        console.error("Error fetching tours:", error);
      }
    };

    fetchTours();

    socket.on("candidateAssigned", ({ tourId, candidate_names, assignedCandidates }) => {
      setTours((prevTours) =>
        prevTours.map((tour) =>
          tour.id === tourId
            ? { ...tour, candidate_names, assignedCandidates }  // Update both names and count
            : tour
        )
      );
    });

    // Listen for guide assignments from the backend
    socket.on("guideAssigned", ({ tourId, guide_names, assignedGuides }) => {
      setTours((prevTours) =>
        prevTours.map((tour) =>
          tour.id === tourId
            ? { ...tour, guide_names, assignedGuides }  // Update both names and count
            : tour
        )
      );
    });

    // Cleanup on component unmount or change
    return () => {
      socket.off("guideAssigned");
      socket.off("candidateAssigned");
    };
  }, []);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const candidates = await AssignTourService.getCandidateGuides();
        const formattedCandidates = candidates.map(candidate => ({
          label: candidate.name, // Display name
          value: candidate.id,   // Unique value
        }));
        setCandidateGuideOptions(formattedCandidates); // Update state
      } catch (error) {
        console.error("Error fetching candidate guides:", error);
      }
    };

    fetchCandidates();
  }, []);


  const handleFilterChange = (filters) => {
    const filtered = tours.filter((tour) => {
      const matchDate =
        !filters.date ||
        new Date(tour.date).toDateString() === filters.date.toDateString();
      const matchDay = !filters.day || tour.day === filters.day;
      const matchTime = !filters.time || tour.time.includes(filters.time);
      const matchSchool =
        !filters.school || tour.school_name.toLowerCase().includes(filters.school.toLowerCase());
      const matchCity =
        !filters.city || tour.city.toLowerCase().includes(filters.city.toLowerCase());
      const matchGuide =
        !filters.guide ||
        (tour.guide_names &&
          tour.guide_names.toLowerCase().includes(filters.guide.toLowerCase()));

      return matchDate && matchDay && matchTime && matchSchool && matchCity && matchGuide;
    });
    setFilteredTours(filtered);
  };

  const handleAssignGuide = async (rowData) => {
    const { school_name, city, date, time } = rowData;
    const userId = localStorage.getItem("userId");
    const userType = localStorage.getItem("userType");

    try {
      const response = await AssignTourService.assignGuideToTour({
        school_name,
        city,
        date,
        time,
        user_id: userId,
        user_type: userType
      });
      setMessage(response.message);

      const updatedTours = await AssignTourService.getReadyTours();
      setTours(updatedTours);
    } catch (error) {
      setMessage(error.message || "Error assigning guide");
    }
  };


  const handleAssignCandidates = async (rowData, selectedCandidates) => {
    const { school_name, city, date, time } = rowData;
    console.log("Attempting to assign candidates:", selectedCandidates);
    console.log("Current assigned candidates:", rowData.assigned_candidates);
    console.log("Guide count / Max candidates allowed:", rowData.guide_count);

    try {
      const response = await AssignTourService.assignCandidateGuidesToTour({
        school_name,
        city,
        date,
        time,
        user_ids: selectedCandidates,
      });
      setMessage(response.message);

      const updatedTours = await AssignTourService.getReadyTours();
      setTours(updatedTours);
      setFilteredTours(updatedTours);
      setSelectedCandidates(prevState => ({
        ...prevState,
        [rowData.id]: [] // Clear the selected candidates for this tour
      }));
    } catch (error) {
      setMessage(error.message || "Error assigning candidate guides");
    }
  };


  const handleInputChange = (id, value) => {
    setClassroomInputs((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleClassroomUpdate = async (tourId) => {
    try {
      const classroom = classroomInputs[tourId]; // Get the input value for the specific row
      if (!classroom) {
        setMessage("Classroom input cannot be empty.");
        return;
      }

      const response = await AssignTourService.updateClassroom(tourId, classroom);
      setMessage(response.message);

      // Clear input for the specific row after save
      setClassroomInputs((prev) => ({
        ...prev,
        [tourId]: "",
      }));

      // Update tours after saving
      const updatedTours = await AssignTourService.getReadyTours();
      setTours(updatedTours);
      setFilteredTours(updatedTours);
    } catch (error) {
      setMessage(error.message || "Error updating classroom");
    }
  };
  const formatTime = (time) => {
    return time.slice(0, 5); // Extract HH:mm
  };

  const rowExpansionTemplate = (data) => {
    // Assuming data is an object containing guide_names and candidate_names
    const guideNames = data.guide_names || "No guides assigned yet.";
    const candidateNames = data.candidate_names || "No candidates assigned yet.";

    // Creating the "pseudo links" for guides and candidates
    const guideLinks = guideNames.split(',').map((name, index) => (
      `<a href="#guide-${index}" class="guide-link">${name.trim()}</a>`
    )).join(', '); // Join them with commas
    const candidateLinks = candidateNames.split(',').map((name, index) => (
      `<a href="#candidate-${index}" class="candidate-link">${name.trim()}</a>`
    )).join(', '); // Join them with commas

    return (
      <div className="p-3">
        <h4>Assigned Guides:</h4>
        <p dangerouslySetInnerHTML={{ __html: guideLinks }}></p>

        <h4>Assigned Candidates:</h4>
        <p dangerouslySetInnerHTML={{ __html: candidateLinks }}></p>
      </div>
    );
  };


  const handleAssignCandidatesDropdown = (rowData) => {
    const assignedCandidateIds = rowData.assigned_candidates.map(c => c.id);
    const unassignedCandidates = candidateGuideOptions.filter(candidate => !assignedCandidateIds.includes(candidate.value));

    return (
      <MultiSelect
        value={selectedCandidates[rowData.id] || []}
        options={unassignedCandidates} // Show only unassigned candidates
        onChange={(e) => {
          console.log("Selected candidates:", e.value); // Log selected IDs
          setSelectedCandidates((prev) => ({
            ...prev,
            [rowData.id]: e.value,
          }));
        }}
        placeholder="Select Candidates"
        display="chip"
        className="p-multiselect-dropdown scrollable-multiselect"
        style={{ width: "100%", whiteSpace: "nowrap", maxWidth: "200px" }}
      />
    );
  };

  const rowClassName = (data) => {
    if (data.tour_status === "CANCELLED") return "cancelled-row";
    if (data.tour_status === "DONE") return "done-row";
    return ""; // Default for READY
  };


  return (
    <div className="assign-tour-container">
      <h1 className="table-title">Tour Assignment</h1>
      <FilterBar onFilterChange={handleFilterChange} /> {/* Render FilterBar */}
      {message && <p className="message">{message}</p>}      <div className="assign-tour-table">
        <DataTable
          value={filteredTours}
          paginator
          rows={50}
          className="p-datatable-striped"
          tableStyle={{ width: "100%" }}
          rowClassName={rowClassName}
          expandedRows={expandedRows}
          onRowToggle={(e) => setExpandedRows(e.data)}
          rowExpansionTemplate={rowExpansionTemplate}
        >
          {/* Date Column */}
          <Column
            field="date"
            header="Date"
            body={(rowData) => formatDate(rowData.date)}
            style={{ width: "10%" }}
          ></Column>

          {/* Day Column */}
          <Column field="day" header="Day" style={{ width: "10%" }}></Column>

          {/* Time Column */}
          <Column
            field="time"
            header="Time"
            body={(rowData) => formatTime(rowData.time)}
            style={{ width: "10%" }}
          ></Column>

          {/* School Column */}
          <Column field="school_name" header="School" style={{ width: "20%" }}></Column>

          {/* City Column */}
          <Column field="city" header="City" style={{ width: "10%" }}></Column>

          {/* Tour Size Column */}
          <Column field="tour_size" header="Tour Size" style={{ width: "10%" }}></Column>
          <Column
            field="classroom"
            header="Classroom"
            body={(rowData) => {
              if (
                rowData.classroom === null &&
                rowData.tour_status === "READY" &&
                (localStorage.getItem("userType") === "4" || localStorage.getItem("userType") === "3")
              ) {
                return (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "10px" }}>
                    <input
                      type="text"
                      value={classroomInputs[rowData.id] || ""} // Get value for the specific row
                      onChange={(e) => handleInputChange(rowData.id, e.target.value)} // Update the value for the specific row
                      placeholder="Enter Classroom"
                      style={{ marginRight: "10px" }}
                    />
                    <Button
                      label="Save"
                      icon="pi pi-check"
                      className="p-button-sm p-button-success"
                      onClick={() => handleClassroomUpdate(rowData.id)} // Pass the specific row ID
                      disabled={!classroomInputs[rowData.id]} // Disable button if input is empty
                    />
                  </div>
                );
              }
              return rowData.classroom || "Not Assigned";
            }}
            style={{ width: "15%" }}
          />


          {/* Guide Quota Column */}
          <Column
            field="assigned_guides"
            header="Guide #"
            body={(rowData) =>
              `${rowData.assigned_guides || 0} / ${rowData.guide_count}`
            }
            
            style={{ width: "10%" }}
          ></Column>

          {/* Candidate Quota Column */}
          <Column
            field="assigned_candidates"
            header="Candidate #"
            body={(rowData) =>
              `${rowData.assigned_candidates || 0} / ${rowData.guide_count}`
            }
            style={{ width: "10%" }}
          ></Column>

          <Column
            header="Be Guide"
            body={(rowData) => {
              if (rowData.tour_status === "READY") {
                return (
                  <Button
                    icon="pi pi-plus"
                    className="p-button-rounded p-button-success"
                    onClick={() => handleAssignGuide(rowData)}
                    style={{ width: "45px" }}
                  />
                );
              }
              return null;
            }}
            style={{ width: "10%" }}
          ></Column>
          {localStorage.getItem("userType") === '3' || localStorage.getItem("userType") === '4' ?
            (<Column
              header="Assign Candidate"
              body={(rowData) => {
                if (rowData.tour_status === "READY") {
                  const selectedForTour = selectedCandidates[rowData.id] || [];
                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <MultiSelect
                        value={selectedForTour}
                        options={candidateGuideOptions}
                        onChange={(e) => {
                          setSelectedCandidates((prev) => ({
                            ...prev,
                            [rowData.id]: e.value,
                          }));
                        }}
                        placeholder="Select Candidates"
                        display="chip"
                        className="p-multiselect-dropdown scrollable-multiselect"
                        style={{ width: "100%", whiteSpace: "nowrap", maxWidth: "200px" }}
                      />
                      <Button
                        label="Confirm"
                        icon="pi pi-check"
                        className="p-button-sm p-button-rounded p-button-success"
                        onClick={() => handleAssignCandidates(rowData, selectedForTour)}
                        disabled={selectedForTour.length === 0}
                        style={{ alignSelf: "center", width: "60%" }}
                      />
                    </div>
                  );
                }
                return null;
              }}
              style={{ width: "20%" }}
            ></Column>) : null}

          <Column
            expander
            style={{ width: '3rem' }} // Adjust width of the expander column
          />

        </DataTable>
      </div>
    </div>
  );
}
