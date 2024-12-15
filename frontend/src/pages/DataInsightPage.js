import React, { useState, useEffect, useRef } from "react";
import { Toast } from "primereact/toast"; // (2) Importing Toast
import Sidebar from "../components/common/Sidebar";
import TourDaysChart from "../components/data/TourDaysChart";
import CancellationStatsPieChart from "../components/data/CancellationStatsChart";
import ToursByCityChart from "../components/data/ToursByCityChart"; 
import SchoolStudentChart from "../components/data/SchoolStudent";
import { fetchTourData } from "../services/DataService";
import "./DataInsightPage.css";
import '../components/common/CommonComp.css';
import Unauthorized from './Unauthorized'; // Import the Unauthorized component
import useProtectRoute from '../hooks/useProtectRoute';

const DataInsightPage = () => {
  const isAuthorized = useProtectRoute([4]); // Check authorization
  const [filter, setFilter] = useState("weekly");
  const [periodIndex, setPeriodIndex] = useState(0);
  const [tourData, setTourData] = useState(null);
  const toast = useRef(null); // (3) Toast ref

  useEffect(() => {
    setPeriodIndex(0); 
  }, [filter]);

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await fetchTourData(filter, periodIndex);
        setTourData(data);

        // Show success toast after data is loaded
        toast.current.clear(); // (4) Clear before showing toast
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Data loaded successfully.",
          life: 3000,
        });
      } catch (error) {
        console.error("Error fetching tour data:", error);

        // Show error toast if data fetching fails
        if (toast.current) {
          toast.current.clear();
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: "Failed to load data. Please try again.",
            life: 3000,
          });
        }
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
  };
  if (!isAuthorized) {
    return <Unauthorized />;
  }
  return (
    <div className="page-container">
      <Sidebar />
      <Toast ref={toast} /> {/* (5) Adding Toast component to JSX */}
      <div className="page-content">
        <h1 >Data Insights</h1>
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
              <SchoolStudentChart />
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
