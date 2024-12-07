import React, { useState, useRef } from 'react';
import { Toast } from 'primereact/toast'; // Import Toast
import PropTypes from 'prop-types';
import FairLeftForm from './FairLeftForm';
import FairRightForm from './FairRightForm';
import Buttons from './Buttons';
import './TourForm.css'; // Reuse styles from TourForm

const FairForm = ({ onClose }) => {
  const [date, setDate] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [city, setCity] = useState({ value: 'Ankara', label: 'Ankara' });
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const toastRef = useRef(null);

  const handleClear = () => {
    // Reset all fields
    setDate('');
    setOrganizationName('');
    setCity('');
    setApplicantName('');
    setApplicantEmail('');
    setApplicantPhone('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submissionData = {
      date: date,
      organization_name: organizationName,
      city: city.value,
      applicant_name: applicantName,
      applicant_email: applicantEmail,
      applicant_phone: applicantPhone.replace(/\s/g, ''), // Remove spaces
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/fairs/createFair`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        toastRef.current.show({
          severity: 'success',
          summary: 'Fair Application Submitted',
          detail: 'Your application has been submitted successfully!',
          life: 5000, // Notification disappears after 5 seconds
        });
        handleClear(); 
      } else {
        const errorData = await response.json();
        toastRef.current.show({
          severity: 'error',
          summary: 'Submission Failed',
          detail: errorData.message || 'An error occurred while submitting the form.',
          life: 5000,
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toastRef.current.show({
        severity: 'error',
        summary: 'Network Error',
        detail: 'Unable to connect to the server. Please try again later.',
        life: 5000,
      });
    }
  };

  return (
    <>
      <Toast ref={toastRef} /> {/* Toast component for notifications */}
      <form className="tour-form-container" onSubmit={handleSubmit}>
        <div className="tour-form-inner">
          <h1 style={{ textAlign: 'center', fontSize: '24px', marginBottom: '20px' }}>
            Apply to a Fair!
          </h1>
          <div className="tour-form-sections">
            <FairLeftForm
              organizationName={organizationName}
              setOrganizationName={setOrganizationName}
              city={city}
              setCity={setCity}
              date={date}
              setDate={setDate}
            />
            <FairRightForm
              applicantName={applicantName}
              setApplicantName={setApplicantName}
              applicantPhone={applicantPhone}
              setApplicantPhone={setApplicantPhone}
              applicantEmail={applicantEmail}
              setApplicantEmail={setApplicantEmail}
            />
          </div>
          <Buttons handleClear={handleClear} />
        </div>
      </form>
    </>
  );
};

FairForm.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default FairForm;
