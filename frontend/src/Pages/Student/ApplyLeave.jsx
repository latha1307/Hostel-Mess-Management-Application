
import { SNavbar } from '../../components/Student/SNavbar';
import { SLeave } from '../../components/Student/SLeave';
import PropTypes from 'prop-types'; 

function ApplyLeave({ studentData }) {
    return (
        <>
         <SNavbar studentData={studentData}/>
        <div className=' h-[100vh] bg-primary'>
           
            {studentData && <SLeave studentData={studentData} />} 
        </div>
        </>
    );
}


ApplyLeave.propTypes = {
    studentData: PropTypes.shape({
        student_id: PropTypes.string.isRequired, 
        
    }).isRequired, 
};

export default ApplyLeave;
