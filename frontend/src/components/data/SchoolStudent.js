import React, { useState, useEffect } from "react";
import "./SchoolStudent.css";
import { Chart } from "primereact/chart";
import { fetchSchoolStudentData } from "../../services/DataService";

const SchoolStudentChart = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [schoolData, setSchoolData] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 4;
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        const data = await fetchSchoolStudentData(year);
        console.log("API Response:", data); // Debugging
        setSchoolData(data.schoolData);
        setCurrentPage(0); // Reset page when year changes
      } catch (error) {
        console.error("Error fetching yearly school student data:", error);
        setSchoolData([]); // Set empty data in case of an error
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [year]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const totalPages = Math.ceil(schoolData.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = schoolData.slice(startIndex, endIndex);

  const labels = currentData.map((school) => school.school_name);

  // Select the correct student sent data based on the year
  const studentSent = currentData.map((school) => {
    if (year === new Date().getFullYear()) {
      return school.sent_last1 || 0; // Current year
    } else if (year === new Date().getFullYear() - 1) {
      return school.sent_last2 || 0; // Last year
    } else if (year === new Date().getFullYear() - 2) {
      return school.sent_last3 || 0; // Two years ago
    } else {
      return 0; // Default for unsupported years
    }
  });

  const remainingStudents = currentData.map(
    (school) => (school.total_tour_size || 0) - studentSent[currentData.indexOf(school)]
  );

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: `Student Sent`,
        backgroundColor: "#007bff", // Student Sent color
        data: studentSent,
        barThickness: 120,
      },
      {
        label: `Total Students`,
        backgroundColor: "#cccccc", // Remaining students color
        data: remainingStudents,
        barThickness: 120,
      },
    ],
  };

  const options = {
    indexAxis: "x",
    scales: {
      x: {
        stacked: true, // Enable stacking
        ticks: {
          autoSkip: false,
        },
      },
      y: {
        stacked: true, // Enable stacking
        beginAtZero: true,
        title: {
          display: true,
          text: "Student Count",
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const index = tooltipItem.dataIndex;
            const totalStudents =
              studentSent[index] + remainingStudents[index]; // Calculate total students

            if (tooltipItem.dataset.label === "Student Sent") {
              return `Student Sent: ${tooltipItem.raw}`;
            } else if (tooltipItem.dataset.label === "Remaining Students") {
              return `Remaining Students: ${tooltipItem.raw}`;
            } else {
              return `Total Students: ${totalStudents}`;
            }
          },
        },
      },
      legend: {
        position: "top",
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  // Pagination and Year Navigation Handlers
  const handlePreviousYear = () => {
    setYear((prevYear) => prevYear - 1);
  };

  const handleNextYear = () => {
    setYear((prevYear) => prevYear + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages - 1));
  };

  const handleYearChange = (e) => {
    const selectedYear = parseInt(e.target.value, 10);
    if (!isNaN(selectedYear)) {
      setYear(selectedYear);
    }
  };

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h2>Students Coming from Schools - {year}</h2>
        <div className="year-selector-modern">
          <button
            className="year-button"
            onClick={handlePreviousYear}
            title="Previous Year"
          >
            <i className="pi pi-chevron-left"></i>
          </button>
          <span className="year-display">{year}</span>
          <button
            className="year-button"
            onClick={handleNextYear}
            title="Next Year"
          >
            <i className="pi pi-chevron-right"></i>
          </button>
        </div>
      </div>
      {schoolData.length > 0 ? (
        <>
          <div className="chart-shadow">
            <Chart
              type="bar"
              data={chartData}
              options={options}
              style={{ height: "400px" }}
            />
          </div>
          <div className="navigation-buttons">
            <button onClick={handlePreviousPage} disabled={currentPage === 0}>
              &lt;&lt;
            </button>
            <span>
              Page {currentPage + 1} of {totalPages}
            </span>
            <button onClick={handleNextPage} disabled={currentPage === totalPages - 1}>
              &gt;&gt;
            </button>
          </div>
        </>
      ) : (
        <div>No data available for the year {year}</div>
      )}
    </div>
  );
};

export default SchoolStudentChart;
