import React, { useState, useRef } from 'react';
import './TourForm.css';
import { Toast } from 'primereact/toast'; // Import Toast
import Title from './Title';
import LeftForm from './LeftForm';
import RightForm from './RightForm';
import Buttons from './Buttons';
import IndividualTourForm from './IndividualTourForm';
import FairForm from './FairForm';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const TourForm = () => {
  // ============================
  // State Variables for LeftForm
  // ============================

  const [city, setCity] = useState({ value: 'Ankara', label: 'Ankara' });
  const [schoolName, setSchoolName] = useState({ value: '', label: '' });
  const [numberOfStudents, setNumberOfStudents] = useState('');
  const [tourDate, setTourDate] = useState('');
  const [selectedTimes, setSelectedTimes] = useState([]);

  // =============================
  // State Variables for RightForm
  // =============================

  const [responsibleName, setResponsibleName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [visitorNotes, setVisitorNotes] = useState('');

  // ============================
  // Toast Reference
  // ============================
  const toastRef = useRef(null);

  const [isIndividualTourModalOpen, setIndividualTourModalOpen] = useState(false);
  const [isFairModalOpen, setFairModalOpen] = useState(false);
  // ==========================
  // Handler to Reset All Fields
  // ==========================

  const handleClear = () => {
    // Reset LeftForm fields
    setCity({ value: 'Ankara', label: 'Ankara' });
    setSchoolName('');
    setNumberOfStudents('');
    setTourDate('');
    setSelectedTimes([]);

    // Reset RightForm fields
    setResponsibleName('');
    setPhoneNumber('');
    setEmail('');
    setVisitorNotes('');
  };

  // ============================
  // Handler for Form Submission
  // ============================

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    const submissionData = {
      school_name: schoolName.value,
      city: city.value,
      academic_year_start: new Date().getFullYear(),
      date: tourDate,
      tour_size: Number(numberOfStudents),
      teacher_name: responsibleName,
      teacher_phone: phoneNumber.replace(/\s/g, ''), // Remove spaces
      teacher_email: email,
      time_preferences: selectedTimes.filter((time) => time !== ''),
      visitor_notes: visitorNotes,
    };

    try {
      const response = await fetch('http://localhost:3001/tour/addTour', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Success:', data);

        // Show success message
        toastRef.current.show({
          severity: 'success',
          summary: 'Application Submitted',
          detail: 'Your application has been submitted successfully!',
          life: 5000, // Notification disappears after 5 seconds
        });

        handleClear(); // Clear the form
      } else {
        const errorData = await response.json();

        // Show error message with server-provided details
        toastRef.current.show({
          severity: 'error',
          summary: 'Submission Failed',
          detail: errorData.message || 'An error occurred while submitting the form.',
          life: 5000,
        });
      }
    } catch (error) {
      console.error('Network Error:', error);

      // Show network error notification
      toastRef.current.show({
        severity: 'error',
        summary: 'Network Error',
        detail: 'Please check your internet connection and try again.',
        life: 5000,
      });
    }
  };

  return (
    <>
      <Toast ref={toastRef} /> {/* Toast component for notifications */}
      <form className="tour-form-container" onSubmit={handleSubmit}>
        <div className="tour-form-inner">
          <Title />
          <div className="tour-form-sections">
            <LeftForm
              city={city}
              setCity={setCity}
              schoolName={schoolName}
              setSchoolName={setSchoolName}
              numberOfStudents={numberOfStudents}
              setNumberOfStudents={setNumberOfStudents}
              tourDate={tourDate}
              setTourDate={setTourDate}
              selectedTimes={selectedTimes}
              setSelectedTimes={setSelectedTimes}
            />
            <RightForm
              responsibleName={responsibleName}
              setResponsibleName={setResponsibleName}
              phoneNumber={phoneNumber}
              setPhoneNumber={setPhoneNumber}
              email={email}
              setEmail={setEmail}
              visitorNotes={visitorNotes}
              setVisitorNotes={setVisitorNotes}
            />
          </div>
          <Buttons handleClear={handleClear} />
          <div className="form-links">
            <button
              type="button"
              className="link-button"
              onClick={() => setIndividualTourModalOpen(true)}
            >
              Apply to an Individual Tour
            </button>
            <button
              type="button"
              className="link-button"
              onClick={() => setFairModalOpen(true)}
            >
              Invite to a Fair
            </button>
          </div>
        </div>
      </form>
      <Modal
        isOpen={isIndividualTourModalOpen}
        onRequestClose={() => setIndividualTourModalOpen(false)}
        className="modal"
        overlayClassName="modal-overlay"
      >
        <button
          className="modal-close-button"
          onClick={() => setIndividualTourModalOpen(false)}
        >
          &times;
        </button>
        <IndividualTourForm onClose={() => setIndividualTourModalOpen(false)} />
      </Modal>

      {/* Fair Modal */}
      <Modal
        isOpen={isFairModalOpen}
        onRequestClose={() => setFairModalOpen(false)}
        className="modal"
        overlayClassName="modal-overlay"
      >
        <button
          className="modal-close-button"
          onClick={() => setFairModalOpen(false)}
        >
          &times;
        </button>
        <FairForm onClose={() => setFairModalOpen(false)} />
      </Modal>
    </>
  );
};

export default TourForm;
