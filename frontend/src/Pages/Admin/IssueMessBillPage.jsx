import { useState } from "react";
import Sidebar from "../../components/Admin/ASideNavebar";
import IssueMessBill from "../../components/Admin/IssueMessBill";

export const IssueMessBillPage = () => {
  // State to manage if the sidebar is open
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      <div className="flex lg:h-[100vh]">
        {/* Sidebar */}
        <div className={`transition-all duration-300 ${sidebarOpen ? 'w-60' : 'w-16'}`}>
          <Sidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />
        </div>

        {/* Content Area */}
        <div className={`flex flex-col mt-24 justify-center p-10 pt-2 pb-2 w-full transition-all duration-300 ease-in-out`}>
          <div>
            {/* Styled H1 Tag */}
            <h1 className="text-3xl font-bold text-center text-[#000000] mb-4 ">
              Mess Bill Distribution
            </h1>
          </div>
          <IssueMessBill />
        </div>
      </div>
    </>
  );
};
