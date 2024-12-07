import React from 'react';
import './RightForm.css';
import PropTypes from 'prop-types';

const IndividualRightForm = ({
  numberOfStudents,
  setNumberOfStudents,
  contactPhone,
  setContactPhone,
  email,
  setEmail,
  visitorNotes,
  setVisitorNotes,
}) => {
  // Handler for phone number input with formatting (e.g., 0 XXX XXX XX XX)
  const handleContactPhoneChange = (e) => {
    // Remove all non-digit characters
    let input = e.target.value.replace(/\D/g, '').substring(0, 11); // Limit to 11 digits

    // Format the phone number as 0 XXX XXX XX XX
    let formattedNumber = '';
    if (input.length > 0) {
      formattedNumber = '0';
    }
    if (input.length > 1 && input.length <= 4) {
      formattedNumber += ` ${input.substring(1)}`;
    } else if (input.length > 4 && input.length <= 7) {
      formattedNumber += ` ${input.substring(1, 4)} ${input.substring(4)}`;
    } else if (input.length > 7 && input.length <= 9) {
      formattedNumber += ` ${input.substring(1, 4)} ${input.substring(4, 7)} ${input.substring(7)}`;
    } else if (input.length > 9) {
      formattedNumber += ` ${input.substring(1, 4)} ${input.substring(4, 7)} ${input.substring(7, 9)} ${input.substring(9)}`;
    }

    setContactPhone(formattedNumber);
  };

  // Handler for number of students input with validation
  const handleNumberOfStudentsChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,3}$/.test(value) && (value === '' || (Number(value) >= 0))) {
      setNumberOfStudents(value);
    }
  };

  return (
    <div className="right-form">
      {/* Number of Students */}
      <div className="form-group">
        <label htmlFor="numberOfStudents">Number of Students</label>
        <input
          type="text"
          id="numberOfStudents"
          name="numberOfStudents"
          className="form-control"
          placeholder="Enter number of students (0-50)"
          value={numberOfStudents}
          onChange={handleNumberOfStudentsChange}
          required
        />
      </div>

      {/* Contact Phone */}
      <div className="form-group">
        <label htmlFor="contactPhone">Contact Phone</label>
        <input
          type="text"
          id="contactPhone"
          name="contactPhone"
          className="form-control"
          placeholder="0 XXX XXX XX XX"
          value={contactPhone}
          onChange={handleContactPhoneChange}
          required
        />
      </div>

      {/* Email */}
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          className="form-control"
          placeholder="example@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="visitorNotes">Visitor Notes</label>
        <textarea
          id="visitorNotes"
          name="visitorNotes"
          className="form-control"
          placeholder="If you have anything to share with us, please add it here."
          value={visitorNotes}
          onChange={(e) => setVisitorNotes(e.target.value)}
        />
      </div>
    </div>
  );
};

// PropTypes for type checking and ensuring required props are passed
IndividualRightForm.propTypes = {
  numberOfStudents: PropTypes.string.isRequired,
  setNumberOfStudents: PropTypes.func.isRequired,
  contactPhone: PropTypes.string.isRequired,
  setContactPhone: PropTypes.func.isRequired,
  email: PropTypes.string.isRequired,
  setEmail: PropTypes.func.isRequired,
  visitorNotes: PropTypes.string.isRequired,
  setVisitorNotes: PropTypes.func.isRequired,
};

export default IndividualRightForm;
