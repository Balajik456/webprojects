import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/owner/Sidebar";
import Navbarowner from "../../components/owner/Navbarowner";
import { useAppContext } from "../../context/Appcontext";

const Layout = () => {
  const {isOwner,navigate} = useAppContext()
  useEffect(()=>{
    if (!isOwner) {
      navigate('/')
      
    }
  },[isOwner])
  return (
    <div className="flex flex-col min-h-screen">
      <Navbarowner />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
