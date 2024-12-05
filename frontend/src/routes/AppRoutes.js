import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import HomePage from "../pages/HomePage";
import NotFound from "../pages/NotFound";
import ForgotPassword from "../pages/ForgotPassword";
import DashboardPage from "../pages/DashboardPage";
import SettingsPage from "../pages/SettingsPage";
import ResetPassword from "../pages/ResetPassword";
import OtpVerification from "../pages/OtpVerification";
import GuideInfoPage from "../pages/GuideInfoPage";
import PuantajPage from "../pages/PuantajPage";
import TourAssignmentPage from "../pages/TourAssignment";
import AdvisorPage from "../pages/AdvisorPage"; // Adjust path if necessar
import UserManagementPage from "../pages/UserManagementPage";
import TourApprovalPage from "../pages/TourApproval";
import DataInsightPage from "../pages/DataInsightPage";
import FeedbackPage from "../pages/FeedbackPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/home" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="*" element={<NotFound />} />
      <Route path="/" element={<Navigate replace to="/home" />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/verify-otp" element={<OtpVerification />} />
      <Route path="/guideInfo" element={<GuideInfoPage />} />
      <Route path="/puantaj-page" element={<PuantajPage />} />
      <Route path="/assign-tour" element={<TourAssignmentPage />} />
      <Route path="/advisors" element={<AdvisorPage />} />
      <Route path="/manageUser" element={<UserManagementPage />} />
      <Route path="/data-insight" element={<DataInsightPage />} />
      <Route path="/approve-tour" element={<TourApprovalPage />} />
      <Route path="/feedback" element={<FeedbackPage />} />
     
    </Routes>
  );
};

export default AppRoutes;
