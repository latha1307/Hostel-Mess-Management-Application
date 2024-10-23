import PropTypes from 'prop-types';

export const SProfile = ({ student }) => {
  console.log(student);
  const photoSrc = student.student_photo ? `data:image/jpeg;base64,${student.student_photo}` : '../../assets/studentProfileImage.jpg'; // Fallback if photo is not available

  return (
    <div className='flex flex-col justify-center items-center'>
      <img 
        src={photoSrc} 
        alt="Student Profile" 
        className='max-w-sm space-y-8 md:max-w-md w-1/2 lg:w-1/3 lg:mt-0' 
      />
      <h1 className='text-sm'>REG NO: {student.roll_no}</h1>
      <button className='mt-4 bg-[#499D34] text-sm transition-all duration-300 rounded-3xl text-white hover:bg-green-700 px-6 py-3 my-2 md:max-w-sm lg:max-w-md'>Update Profile</button>
      <button className='bg-[#EF821D] text-sm transition-all duration-300 rounded-3xl text-white hover:bg-orange-600 px-3 py-3 my-2 md:max-w-sm'>Change Password</button>
    </div>
  );
};


SProfile.propTypes = {
  student: PropTypes.shape({
    roll_no: PropTypes.string.isRequired,
    student_photo: PropTypes.string.isRequired, 
    student_name: PropTypes.string.isRequired,
    year: PropTypes.string.isRequired,
    department: PropTypes.string.isRequired,
    dob: PropTypes.string.isRequired,
    roomNo: PropTypes.string.isRequired,
    billStatus: PropTypes.string.isRequired,
    admissionDate: PropTypes.string.isRequired
  }).isRequired
};
