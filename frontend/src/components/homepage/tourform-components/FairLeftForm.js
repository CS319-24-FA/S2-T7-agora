import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select'; // Import react-select for cities
import './LeftForm.css'; // Reuse styles from LeftForm

const FairLeftForm = ({ organizationName, setOrganizationName, city, setCity, date, setDate }) => {
  const citiesList = [
    'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Aksaray', 'Amasya', 'Ankara', 'Antalya',
    'Ardahan', 'Artvin', 'Aydın', 'Balıkesir', 'Bartın', 'Batman', 'Bayburt', 'Bilecik',
    'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli',
    'Diyarbakır', 'Düzce', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir', 'Gaziantep',
    'Giresun', 'Gümüşhane', 'Hakkâri', 'Hatay', 'Iğdır', 'Isparta', 'İstanbul', 'İzmir',
    'Kahramanmaraş', 'Karabük', 'Karaman', 'Kars', 'Kastamonu', 'Kayseri', 'Kilis', 'Kırıkkale',
    'Kırklareli', 'Kırşehir', 'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Mardin',
    'Mersin', 'Muğla', 'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Osmaniye', 'Rize', 'Sakarya',
    'Samsun', 'Şanlıurfa', 'Siirt', 'Sinop', 'Sivas', 'Şırnak', 'Tekirdağ', 'Tokat', 'Trabzon',
    'Tunceli', 'Uşak', 'Van', 'Yalova', 'Yozgat', 'Zonguldak',
  ];

  // Convert cities array to options for react-select
  const cityOptions = citiesList.map((cityName) => ({
    value: cityName,
    label: cityName,
  }));

  return (
    <div className="left-form">
      {/* Organization Name */}
      <div className="form-group">
        <label htmlFor="organizationName">Organization Name</label>
        <input
          type="text"
          id="organizationName"
          name="organizationName"
          className="form-control"
          placeholder="Enter organization name"
          value={organizationName}
          onChange={(e) => setOrganizationName(e.target.value)}
          required
        />
      </div>

      {/* City */}
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
          required
          filterOption={(candidate, input) => {
            const candidateLabel = candidate.label.toLocaleLowerCase('tr'); // Convert label to lowercase using Turkish locale
            const inputValue = input.toLocaleLowerCase('tr'); // Convert input to lowercase using Turkish locale
            return candidateLabel.includes(inputValue); // Perform case-insensitive search
          }}
        />
      </div>

      {/* Date */}
      <div className="form-group">
        <label htmlFor="date">Date</label>
        <input
          type="date"
          id="date"
          name="date"
          className="form-control"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>
    </div>
  );
};

FairLeftForm.propTypes = {
  organizationName: PropTypes.string.isRequired,
  setOrganizationName: PropTypes.func.isRequired,
  city: PropTypes.object.isRequired,
  setCity: PropTypes.func.isRequired,
  date: PropTypes.string.isRequired,
  setDate: PropTypes.func.isRequired,
};

export default FairLeftForm;
