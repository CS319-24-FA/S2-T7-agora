import React, { useState, useEffect } from "react";
import Sidebar from "../components/common/Sidebar";
import TourDaysChart from "../components/data/TourDaysChart";
import CancellationStatsPieChart from "../components/data/CancellationStatsChart";
import ToursByCityChart from "../components/data/ToursByCityChart"; // Import the new component
import SchoolStudentChart from "../components/data/SchoolStudent"; // Corrected import
import { fetchTourData } from "../services/DataService"; // Removed fetchSchoolStudentData
import "./DataInsightPage.css";

const DataInsightPage = () => {
  const [filter, setFilter] = useState("weekly");
  const [periodIndex, setPeriodIndex] = useState(0);
  const [tourData, setTourData] = useState(null);
  
  useEffect(() => {
    setPeriodIndex(0); 
  }, [filter]);

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await fetchTourData(filter, periodIndex);
        setTourData(data);
      } catch (error) {
        console.error("Error fetching tour data:", error);
      }
    };

    getData();
  }, [filter, periodIndex]);

  const maxPeriod =
    filter === "weekly" ? 3 : filter === "monthly" ? 11 : filter === "yearly" ? 5 : 0;

  const handlePrevious = () => {
    if (periodIndex < maxPeriod) {
      setPeriodIndex(periodIndex + 1);
    }
  };

  const handleNext = () => {
    if (periodIndex > 0) {
      setPeriodIndex(periodIndex - 1);
    }
  };

  const handleFilterChange = (type) => {
    setFilter(type.toLowerCase());
    // Removed setCurrentYear as it's now managed within SchoolStudentChart
  };

  return (
    <div className="data-insight-page">
      <Sidebar />
      <div className="data-insight-content">
        <h1>Data Insights</h1>
        <div className="filter-buttons">
          {["Yearly", "Monthly", "Weekly"].map((type) => (
            <button
              key={type}
              className={filter.toLowerCase() === type.toLowerCase() ? "active" : ""}
              onClick={() => handleFilterChange(type)}
            >
              {type}
            </button>
          ))}
        </div>
        <div className="charts">
          {tourData ? (
            <>
              <TourDaysChart
                data={tourData.tourDays}
                startDate={tourData.startDate}
                endDate={tourData.endDate}
                periodIndex={periodIndex}
                handlePrevious={handlePrevious}
                handleNext={handleNext}
                maxPeriod={maxPeriod}
              />
              <CancellationStatsPieChart
                data={tourData.tourStatusData}
                startDate={tourData.startDate}
                endDate={tourData.endDate}
                periodIndex={periodIndex}
                handlePrevious={handlePrevious}
                handleNext={handleNext}
                maxPeriod={maxPeriod}
              />
              <ToursByCityChart
                data={tourData.toursByCity}
                startDate={tourData.startDate}
                endDate={tourData.endDate}
                periodIndex={periodIndex}
                handlePrevious={handlePrevious}
                handleNext={handleNext}
                maxPeriod={maxPeriod}
              />
              <SchoolStudentChart /> {/* Removed props */}
            </>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataInsightPage;
