import { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';


function SLogin({ onLoginSuccess, onLoginError, setLoading }) {
  const navigate = useNavigate()
  const [registrationNo, setRegistrationNo] = useState(''); 
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8081/api/student/login', {
        registration_no: registrationNo,
        password: password
      });

      if (response.status === 200) {
        console.log('Login successful, navigating to profile...');
        onLoginSuccess(response.data.studentData); 
        navigate('/student-profile', { state: { student: response.data.studentData } });
      }
    } catch (err) {
      console.error('Login failed:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Invalid email or registration number.');
      onLoginError(err.response?.data?.message || 'Invalid email or registration number.');
    } finally {
      setLoading(false); 
    }
  };


  return (
    <div className='bg-slate-800 border border-slate-600 rounded-md p-8 shadow-lg backdrop-filter backdrop-blur-lg bg-opacity-30 relative transition-all duration-200'>
      <h1 className='text-4xl text-white font-bold font-sans text-center mb-6'>Student Login</h1>
      <form onSubmit={handleSubmit}>
        <div className="relative my-10">
          <input 
            type="number" 
            value={registrationNo} 
            onChange={(e) => setRegistrationNo(e.target.value)} 
            className='block w-72 py-2.3 px-0 text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:text-white focus:border-blue-600 peer'  
            placeholder='' 
            required 
          />
          <label htmlFor="registrationNo" className='absolute font-sans text-sm text-white duration-300 transform -translate-y-6 scale-75 top-0 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'>Register No.</label>
        </div>
        <div className="relative my-10">
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className='block w-72 py-2.3 px-0 text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:text-white focus:border-blue-600 peer' 
            placeholder='' 
            required 
          />
          <label htmlFor="password" className='absolute font-sans text-sm text-white duration-300 transform -translate-y-6 scale-75 top-0 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'>Password</label>
        </div>
        <div className='flex justify-between items-center'>
          <div className='flex gap-2 items-center'>
            <input type="checkbox" name='' id='' />
            <label htmlFor="rememberMe">Remember Me</label>
          </div>
          <span className='text-blue-500 font-sans'>Forget Password?</span>
        </div>
        <button className='w-full mb-4 font-sans text-[18px] mt-6 rounded-full bg-white text-orange-900 hover:bg-orange-600 hover:text-white py-2 transition-colors duration-300' type='submit'>Login</button>
        {error && <p className='text-red-500 text-center'>{error}</p>}
      </form>
    </div>
  );
}

SLogin.propTypes = {
  onLoginSuccess: PropTypes.func.isRequired,
  onLoginError: PropTypes.func.isRequired, 
  setLoading: PropTypes.func.isRequired, 
};

export default SLogin;