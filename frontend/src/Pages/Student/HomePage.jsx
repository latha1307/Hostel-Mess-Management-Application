import { useState } from 'react';
import { SDetails } from "../../components/Student/SDetails";
import { SNavbar } from "../../components/Student/SNavbar";
import { SProfile } from "../../components/Student/SProfile";
import PropTypes from 'prop-types';

function HomePage({ studentData }) {
  const [error, setError] = useState('');

  // Check if studentData is provided
  if (!studentData) {
    setError('No student data provided. Please log in again.');
    return (
      <div className="error-message">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="bg-primary flex h-auto justify-center lg:h-[100vh]">
      <div className="bg-white lg:h-[90vh] h-auto lg:w-[70vw] w-[88vw] border rounded mt-10 mb-10">
        <SNavbar studentData ={studentData}/>
        <div className="flex flex-col lg:flex-row justify-center items-center">
          <div className="lg:h-[74vh] h-[100vh] lg:-ml-20 lg:mb-0 w-1/2 lg:w-1/2">
            <SProfile student={studentData} />
          </div>
          <hr className="bg-black h-[2px] w-[80vw] m-10 lg:w-[1px] lg:h-96" />
          <div className="w-full lg:w-1/2">
            <SDetails student={studentData} />
          </div>
        </div>
      </div>
    </div>
  );
}
HomePage.propTypes = {
  studentData: PropTypes.object.isRequired, // or PropTypes.shape({...}) if you want to define the structure
};

export default HomePage;