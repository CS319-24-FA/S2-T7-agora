import React, { useState, useEffect } from "react";
import "./LeftForm.css";
import Select from "react-select";
import PropTypes from "prop-types";

const LeftForm = ({
  city,
  setCity,
  schoolName,
  setSchoolName,
  numberOfStudents,
  setNumberOfStudents,
  tourDate,
  setTourDate,
  selectedTimes,
  setSelectedTimes,
}) => {
  // List of Turkish cities
  const citiesList = [
    "Adana",
    "Adıyaman",
    "Afyonkarahisar",
    "Ağrı",
    "Aksaray",
    "Amasya",
    "Ankara",
    "Antalya",
    "Ardahan",
    "Artvin",
    "Aydın",
    "Balıkesir",
    "Bartın",
    "Batman",
    "Bayburt",
    "Bilecik",
    "Bingöl",
    "Bitlis",
    "Bolu",
    "Burdur",
    "Bursa",
    "Çanakkale",
    "Çankırı",
    "Çorum",
    "Denizli",
    "Diyarbakır",
    "Düzce",
    "Edirne",
    "Elazığ",
    "Erzincan",
    "Erzurum",
    "Eskişehir",
    "Gaziantep",
    "Giresun",
    "Gümüşhane",
    "Hakkâri",
    "Hatay",
    "Iğdır",
    "Isparta",
    "İstanbul",
    "İzmir",
    "Kahramanmaraş",
    "Karabük",
    "Karaman",
    "Kars",
    "Kastamonu",
    "Kayseri",
    "Kilis",
    "Kırıkkale",
    "Kırklareli",
    "Kırşehir",
    "Kocaeli",
    "Konya",
    "Kütahya",
    "Malatya",
    "Manisa",
    "Mardin",
    "Mersin",
    "Muğla",
    "Muş",
    "Nevşehir",
    "Niğde",
    "Ordu",
    "Osmaniye",
    "Rize",
    "Sakarya",
    "Samsun",
    "Şanlıurfa",
    "Siirt",
    "Sinop",
    "Sivas",
    "Şırnak",
    "Tekirdağ",
    "Tokat",
    "Trabzon",
    "Tunceli",
    "Uşak",
    "Van",
    "Yalova",
    "Yozgat",
    "Zonguldak",
  ];

  // Convert cities array to options for react-select
  const cityOptions = citiesList.map((cityName) => ({
    value: cityName,
    label: cityName,
  }));

  // Predefined tour start times
  const timeOptions = ["09:00", "11:00", "13:30", "16:00"];

  // State variables for school options, loading state, and error state
  const [schoolOptions, setSchoolOptions] = useState([]);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [schoolFetchError, setSchoolFetchError] = useState(null);

  // Fetch schools from backend when component mounts
  useEffect(() => {
    const fetchSchools = async () => {
      setLoadingSchools(true);
      setSchoolFetchError(null);

      try {
        // Construct URL based on whether a city is selected
        const url = city?.value
          ? `${
              process.env.REACT_APP_BACKEND_URL
            }/school/getAllSchools?city=${encodeURIComponent(city.value)}`
          : `${process.env.REACT_APP_BACKEND_URL}/school/getAllSchools`;

        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();
          // Extract school names and convert to options
          const options = data.data.map((school) => ({
            value: school.school_name,
            label: school.school_name,
          }));
          setSchoolOptions(options);
        } else {
          const errorData = await response.json();
          setSchoolFetchError(errorData.message || "Failed to fetch schools.");
        }
      } catch (error) {
        console.error("Error fetching schools:", error);
        setSchoolFetchError("Network error. Please try again later.");
      } finally {
        setLoadingSchools(false);
      }
    };

    fetchSchools();
  }, [city]); // Add city as a dependency

  // Add this useEffect after the previous one
  useEffect(() => {
    // Reset school selection when city changes
    setSchoolName({ value: "", label: "" });
  }, [city, setSchoolName]);

  // Handler to add a new time preference slot
  const addTimePreference = () => {
    setSelectedTimes([...selectedTimes, ""]);
  };

  // Handler to update a specific time preference
  const handleTimeChange = (index, value) => {
    const updatedSelectedTimes = [...selectedTimes];
    updatedSelectedTimes[index] = value;

    // Ensure that each time preference is unique
    setSelectedTimes(updatedSelectedTimes);
  };

  // Handler to remove a specific time preference slot
  const removeTimePreference = (index) => {
    const updatedSelectedTimes = selectedTimes.filter((_, i) => i !== index);
    setSelectedTimes(updatedSelectedTimes);
  };

  // Handler for number of students input with validation
  const handleNumberOfStudentsChange = (e) => {
    const value = e.target.value;
    // Allow only digits, and limit to values between 0 and 300
    if (
      /^\d{0,3}$/.test(value) &&
      (value === "" || (Number(value) >= 0 && Number(value) <= 300))
    ) {
      setNumberOfStudents(value);
    }
  };

  return (
    <div className="left-form">
      {/* City Selection */}
      <div className="form-group">
        <label htmlFor="city">City Your School Resides In</label>
        <Select
          id="city"
          name="city"
          className="react-select-container"
          classNamePrefix="react-select"
          options={cityOptions}
          value={city}
          onChange={(selectedOption) => setCity(selectedOption)}
          placeholder="Select City"
          isSearchable
          isClearable={true}
          required
          filterOption={(candidate, input) => {
            if (!input) return true;
            const candidateLabel = candidate.label.toLocaleLowerCase("tr");
            const inputValue = input.toLocaleLowerCase("tr");
            return candidateLabel.startsWith(inputValue);
          }}
        />
      </div>

      {/* School Name Dropdown */}
      <div className="form-group">
        <label htmlFor="schoolName">School Name</label>
        {loadingSchools ? (
          <p>Loading schools...</p>
        ) : schoolFetchError ? (
          <p className="error-message">{schoolFetchError}</p>
        ) : (
          <Select
            id="schoolName"
            name="schoolName"
            className="react-select-container"
            classNamePrefix="react-select"
            options={schoolOptions}
            value={schoolName}
            onChange={(selectedOption) => setSchoolName(selectedOption)}
            placeholder="Select School"
            isSearchable
            required
            filterOption={(candidate, input) => {
              if (!input) return true;
              const candidateLabel = candidate.label.toLocaleLowerCase("tr");
              const inputValue = input.toLocaleLowerCase("tr");
              return candidateLabel.startsWith(inputValue);
            }}
          />
        )}
      </div>

      {/* Number of Students */}
      <div className="form-group">
        <label htmlFor="numberOfStudents">
          Number of Students Joining the Tour
        </label>
        <input
          type="text"
          id="numberOfStudents"
          name="numberOfStudents"
          className="form-control"
          placeholder="0-300"
          value={numberOfStudents}
          onChange={handleNumberOfStudentsChange}
          required
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
            today.setDate(today.getDate() + 1); // Add one day to today, at least don't apply for today.
            return today.toISOString().split("T")[0]; // Format as YYYY-MM-DD
          })()} // Immediately calculate and set the value
          required
        />
      </div>

      {/* Tour Start Time Preferences */}
      <div className="form-group">
        <label>Tour Start Time Preferences</label>
        {selectedTimes.map((time, index) => (
          <div key={index} className="time-slot">
            <select
              className="form-control"
              value={time}
              onChange={(e) => handleTimeChange(index, e.target.value)}
              required
            >
              <option value="" disabled>
                Select Time
              </option>
              {timeOptions.map((availableTime) =>
                !selectedTimes.includes(availableTime) ||
                availableTime === time ? (
                  <option key={availableTime} value={availableTime}>
                    {availableTime}
                  </option>
                ) : null
              )}
            </select>
            <button
              type="button"
              className="remove-button"
              onClick={() => removeTimePreference(index)}
              disabled={selectedTimes.length <= 1} // Prevent removing last time
            >
              &minus;
            </button>
          </div>
        ))}
        {selectedTimes.length < timeOptions.length && (
          <button
            type="button"
            className="add-button"
            onClick={addTimePreference}
          >
            &#43; Add Preference
          </button>
        )}
      </div>
    </div>
  );
};

// PropTypes for type checking and ensuring required props are passed
LeftForm.propTypes = {
  city: PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  }).isRequired,
  setCity: PropTypes.func.isRequired,
  schoolName: PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  }).isRequired,
  setSchoolName: PropTypes.func.isRequired,
  numberOfStudents: PropTypes.string.isRequired,
  setNumberOfStudents: PropTypes.func.isRequired,
  tourDate: PropTypes.string.isRequired,
  setTourDate: PropTypes.func.isRequired,
  selectedTimes: PropTypes.arrayOf(PropTypes.string).isRequired,
  setSelectedTimes: PropTypes.func.isRequired,
};

export default LeftForm;
