import React from 'react';
import PropTypes from 'prop-types';
import './LeftForm.css';
import Select from 'react-select'; 

const IndividualTourLeftForm = ({
  name,
  setName,
  majorOfInterest,
  setMajorOfInterest,
  tourDate,
  setTourDate,
  selectedTimes,
  setSelectedTimes,
}) => {
  // Full-hour time options from 09:00 to 17:00
  const timeOptions = [
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
  ];

  // Predefined Bilkent University departments
  const deptList = [
    'Information Systems and Technologies',
    'Tourism and Hotel Management',
    'Architecture',
    'Communication and Design',
    'Fine Arts',
    'Graphic Design',
    'Interior Architecture and Environmental Design',
    'Urban Design and Landscape Architecture',
    'Management',
    'Economics',
    'History',
    'International Relations',
    'Political Science and Public Administration',
    'Psychology',
    'Basic Education (Classroom Teaching)',
    'Educational Sciences',
    'Teacher Education',
    'Computer Engineering',
    'Electrical and Electronics Engineering',
    'Industrial Engineering',
    'Mechanical Engineering',
    'American Culture and Literature',
    'Archaeology',
    'English Language and Literature',
    'Philosophy',
    'Translation and Interpretation',
    'Turkish Literature',
    'Law',
    'Chemistry',
    'Mathematics',
    'Molecular Biology and Genetics',
    'Physics',
    'Music',
    'Performing Arts',
  ];

  const deptOptions = deptList.map((dept) => ({
    value: dept,
    label: dept,
  }));  
  
  return (
    <div className="left-form">
      {/* Name */}
      <div className="form-group">
        <label htmlFor="name">Your Name</label>
        <input
          type="text"
          id="name"
          name="name"
          className="form-control"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      {/* Major of Interest */}
      <div className="form-group">
        <label htmlFor="majorOfInterest">Major of Interest</label>
        <Select
          id="majorOfInterest"
          name="majorOfInterest"
          className="react-select-container"
          classNamePrefix="react-select"
          options={deptOptions}
          value={majorOfInterest}
          onChange={(selectedOption) => setMajorOfInterest(selectedOption)}
          placeholder="Select Major of Interest"
          isSearchable
          required
          filterOption={(candidate, input) => {
            const candidateLabel = candidate.label.toLocaleLowerCase();
            const inputValue = input.toLocaleLowerCase();
            return candidateLabel.includes(inputValue);
          }}          
        />
      </div>

      {/* Preferred Tour Date */}
      <div className="form-group">
        <label htmlFor="tourDate">Preferred Date for the Tour</label>
        <input
          type="date"
          id="tourDate"
          name="tourDate"
          className="form-control"
          value={tourDate}
          onChange={(e) => setTourDate(e.target.value)}
          min={(() => {
            const today = new Date();
            today.setDate(today.getDate() + 15); // Add 15 days to today
            return today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
          })()}
          required
        />
      </div>

      {/* Preferred Tour Time */}
      <div className="form-group">
        <label htmlFor="selectedTimes">Preferred Tour Time</label>
        <select
          id="selectedTimes"
          name="selectedTimes"
          className="form-control"
          value={selectedTimes}
          onChange={(e) => setSelectedTimes(e.target.value)}
          required
        >
          <option value="" disabled>
            Select a Time
          </option>
          {timeOptions.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

// PropTypes for type checking and ensuring required props are passed
IndividualTourLeftForm.propTypes = {
  name: PropTypes.string.isRequired,
  setName: PropTypes.func.isRequired,
  majorOfInterest: PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  }).isRequired,  setMajorOfInterest: PropTypes.func.isRequired,
  tourDate: PropTypes.string.isRequired,
  setTourDate: PropTypes.func.isRequired,
  selectedTimes: PropTypes.string.isRequired,
  setSelectedTimes: PropTypes.func.isRequired,
};

export default IndividualTourLeftForm;
