import PropTypes from 'prop-types';

export const SDetails = ({ student }) => {
  return (
    <div className="lg:p-16">
      <ul className="lg:space-y-8 space-y-6 mb-10">
        <li>Name: {student.student_name}</li>
        <li>Year of Study: {student.year}</li>
        <li>Register No: {student.roll_no}</li>
        <li>Department: {student.course}</li> {/* Changed from department to course if it matches your backend */}
        <li>Gender: {student.gender}</li>
        <li>Blood Group: {student.blood_group}</li>
        <li>Annual Income: {student.annual_income} {/* Added annual income if available */}</li>
        <li>Guardian Name: {student.guardian_name} {/* Added guardian name if available */}</li>
      </ul>
    </div>
  );
};

// PropTypes validation
SDetails.propTypes = {
  student: PropTypes.shape({
    roll_no: PropTypes.string.isRequired,
    student_name: PropTypes.string.isRequired,
    year: PropTypes.string.isRequired,
    course: PropTypes.string.isRequired, // Changed from department to course if it matches your backend
    gender: PropTypes.string.isRequired,
    blood_group: PropTypes.string.isRequired,
    annual_income: PropTypes.number, // Added annual income validation
    guardian_name: PropTypes.string // Added guardian name validation
  }).isRequired
};
