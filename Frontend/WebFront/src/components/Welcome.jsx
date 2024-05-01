import Boys from '../assets/Boys-Hostel.jpg';



export const Welcome = () => {


  return (
    <>
      <div className='flex flex-col item-center space-y-10 '>
        <div className="flex flex-col items-center mt-10 ml-20 mr-20 space-y-10">
          <h1 className="font-bold text-primary text-center mt-10 tracking-wider text-2xl border-b" >Welcome to TPGIT Hostels</h1>
          <p className="mt-5 lg:mr-48 lg:ml-48 text-md font-sans">  <span className="font-bold font-sans text-secondary">Home Away From Home, </span>there are separate hostels for both boys & girls. The hostel rooms capacitating 3 beds.The Hostel is managed by the Hostel Residents Council consisting of Patron, Chief Warden, Wardens, Manager, Deputy Wardens, Resident Tutors and Student Representatives.</p>
        
      
          <img src={Boys} alt="Hostel image" className='lg:size-6/12 size-full'/>
        
        </div>
      </div>
    </>
  );
};
