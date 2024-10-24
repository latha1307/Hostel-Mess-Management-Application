
import { SNavbar } from '../../components/Student/SNavbar';
import PropTypes from 'prop-types'; 
import SMessDetails from '../../components/Student/SMessDetails';

function MessBill({ studentData }) {
    return (
        <>
         <SNavbar studentData={studentData}/>
        <div className=' h-[100vh] bg-primary'>
           
            {studentData && <SMessDetails studentData={studentData} />} 
        </div>
        </>
    );
}


MessBill.propTypes = {
    studentData: PropTypes.shape({
        student_id: PropTypes.string.isRequired, 
        
    }).isRequired, 
};

export default MessBill;
