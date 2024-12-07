import React from 'react';
import PropTypes from 'prop-types';
import './RightForm.css'; // Reuse styles from RightForm

const FairRightForm = ({
  applicantName,
  setApplicantName,
  applicantEmail,
  setApplicantEmail,
  applicantPhone,
  setApplicantPhone,
}) => {
  const handlePhoneNumberChange = (e) => {
    let input = e.target.value.replace(/\D/g, '').substring(0, 11); // Limit to 11 digits
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
    setApplicantPhone(formattedNumber);
  };

  return (
    <div className="right-form">
      {/* Applicant Name */}
      <div className="form-group">
        <label htmlFor="applicantName">Applicant Name</label>
        <input
          type="text"
          id="applicantName"
          name="applicantName"
          className="form-control"
          placeholder="Enter your name"
          value={applicantName}
          onChange={(e) => setApplicantName(e.target.value)}
          required
        />
      </div>

      {/* Applicant Phone */}
      <div className="form-group">
        <label htmlFor="applicantPhone">Applicant Phone</label>
        <input
          type="text"
          id="applicantPhone"
          name="applicantPhone"
          className="form-control"
          placeholder="0 XXX XXX XX XX"
          value={applicantPhone}
          onChange={handlePhoneNumberChange}
          required
        />
      </div>

      {/* Applicant Email */}
      <div className="form-group">
        <label htmlFor="applicantEmail">Applicant Email</label>
        <input
          type="email"
          id="applicantEmail"
          name="applicantEmail"
          className="form-control"
          placeholder="example@gmail.com"
          value={applicantEmail}
          onChange={(e) => setApplicantEmail(e.target.value)}
          required
        />
      </div>
    </div>
  );
};

FairRightForm.propTypes = {
  applicantName: PropTypes.string.isRequired,
  setApplicantName: PropTypes.func.isRequired,
  applicantEmail: PropTypes.string.isRequired,
  setApplicantEmail: PropTypes.func.isRequired,
  applicantPhone: PropTypes.string.isRequired,
  setApplicantPhone: PropTypes.func.isRequired,
};

export default FairRightForm;
