import React, { useState, useRef } from 'react';
import { Toast } from 'primereact/toast'; // Import Toast
import PropTypes from 'prop-types';
import IndividualTourLeftForm from './IndividualTourLeftForm';
import IndividualTourRightForm from './IndividualTourRightForm';
import Buttons from './Buttons';
import './TourForm.css'; // Reuse styles from TourForm

const IndividualTourForm = ({ onClose }) => {
  const [name, setName] = useState('');
  const [majorOfInterest, setMajorOfInterest] = useState({ value: 'Computer Engineering', label: 'Computer Engineering' });
  const [tourDate, setTourDate] = useState('');
  const [selectedTimes, setSelectedTimes] = useState('');
  const [numberOfStudents, setNumberOfStudents] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [email, setEmail] = useState('');
  const [visitorNotes, setVisitorNotes] = useState('');

  const toastRef = useRef(null);

  const handleClear = () => {
    // Reset LeftForm fields
    setName('');
    setMajorOfInterest({ value: 'Computer Engineering', label: 'Computer Engineering' });
    setTourDate('');
    setSelectedTimes('');

    // Reset RightForm fields
    setNumberOfStudents('');
    setContactPhone('');
    setEmail('');
    setVisitorNotes('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submissionData = {
      name: name,
      major_of_interest: majorOfInterest.value,
      tour_date: tourDate,
      time: selectedTimes,
      number_of_students: numberOfStudents,
      contact_phone: contactPhone.replace(/\s/g, ''), // Remove spaces
      email: email,
      visitor_notes: visitorNotes,
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/individual-tours/addIndividualTour`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        toastRef.current.show({
          severity: 'success',
          summary: 'Application Submitted',
          detail: 'Your application has been submitted successfully!',
          life: 5000, // Notification disappears after 5 seconds
        });
        handleClear(); // Clear the form
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
            Create Your Application for an Individual Tour!
          </h1>
          <div className="tour-form-sections">
            <IndividualTourLeftForm
              name={name}
              setName={setName}
              majorOfInterest={majorOfInterest}
              setMajorOfInterest={setMajorOfInterest}
              tourDate={tourDate}
              setTourDate={setTourDate}
              selectedTimes={selectedTimes}
              setSelectedTimes={setSelectedTimes}
            />
            <IndividualTourRightForm
              numberOfStudents={numberOfStudents}
              setNumberOfStudents={setNumberOfStudents}
              contactPhone={contactPhone}
              setContactPhone={setContactPhone}
              email={email}
              setEmail={setEmail}
              visitorNotes={visitorNotes}
              setVisitorNotes={setVisitorNotes}
            />
          </div>
          <Buttons handleClear={handleClear} />
        </div>
      </form>
    </>
  );
};

IndividualTourForm.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default IndividualTourForm;
