console.log("Connecting to Render...");
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Start from "./pages/StartPage";
import Home from "./pages/home";
import UserLogin from "./pages/userLogin";
import UserSign from "./pages/userSign";
import CaptionLogin from "./pages/captionLogin";
import CaptionSign from "./pages/captionSign";
import UserProtectWrapper from "./pages/UserProtectWrapper";
import Userlogout from "./pages/Userlogout";
import CaptionHome from "./pages/CaptainHome";
import CaptionProtectWrapper from "./pages/captionProtectedWrapper";
import WaitingForDriver from "./components/WaitingForDriver";
import Riding from "./pages/Riding";
import CaptainArriving from "./pages/CaptainArriving";
import UserArriving from "./pages/UserArriving";
import UserProfile from "./pages/UserProfile";
import CaptainProfile from "./pages/CaptainProfile";

// depolyment update one
console.log("Connecting to Render...");
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Start />} />

        <Route path="/user-login" element={<UserLogin />} />
        <Route path="/user-sign" element={<UserSign />} />

        <Route path="/caption-login" element={<CaptionLogin />} />
        <Route path="/caption-sign" element={<CaptionSign />} />
        <Route
          path="/home"
          element={
            <UserProtectWrapper>
              <Home />
            </UserProtectWrapper>
          }
        />

        <Route
          path="/user/logout"
          element={
            <UserProtectWrapper>
              <Userlogout />
            </UserProtectWrapper>
          }
        />

        <Route
          path="/caption-home"
          element={
            <CaptionProtectWrapper>
              <CaptionHome />
            </CaptionProtectWrapper>
          }
        />

        <Route path="/waiting-for-driver" element={<WaitingForDriver />} />

        <Route path="/Riding" element={<Riding />} />
        <Route path='/captain-arriving' element={<CaptainArriving />} />
        <Route path="/user-arriving" element={<UserArriving />} />
        <Route path="/user-profile" element={<UserProfile/>} />
        <Route path="/captain-profile" element={<CaptainProfile/>} />
        
      </Routes>
    </BrowserRouter>
  );
};

export default App;