import { useState } from 'react';
import SLogin from '../../components/Student/SLogin';


function StudentLogin() {
    const [loading, setLoading] = useState(false); 
    const [error, setError] = useState(''); 

    const handleLoginSuccess = (student) => {
        console.log('Login successful for:', student);
        setError(''); 
       
    };

    const handleLoginError = (errorMessage) => {
        setError(errorMessage);
    };

    return (
        <div className="bgStudentLogin bg-cover h-[100vh] flex justify-center items-center text-white">
            <SLogin 
                onLoginSuccess={handleLoginSuccess} 
                onLoginError={handleLoginError} 
                setLoading={setLoading} 
            />
            {loading && <div className="text-white">Logging in...</div>} 
            {error && <div className="text-red-500">{error}</div>} 
        </div>
    );
}

export default StudentLogin;
