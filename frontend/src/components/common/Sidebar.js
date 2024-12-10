import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";
import defaultProfileImage from "../../assets/profile.jpg";
import { Toast } from "primereact/toast";

// Module-level variables to cache profile image and user profile
let cachedProfileImage = null;
let cachedUserProfile = null;

const Sidebar = ({ setCurrentPage }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(
    cachedProfileImage || defaultProfileImage
  );
  const [userName, setUserName] = useState(
    cachedUserProfile
      ? `${cachedUserProfile.firstName} ${cachedUserProfile.lastName}`
      : ""
  );
  const [isLoadingPicture, setIsLoadingPicture] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [userType, setUserType] = useState(null);
  const toast = useRef(null);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const handleNavigation = (page) => {
    if (page === "logout") {
      localStorage.clear();
      navigate("/login");
    } else {
      navigate(`/${page}`);
    }
  };

  // Helper function to get user ID from localStorage
  const getUserId = () => {
    return localStorage.getItem("userId");
  };

  // Function to fetch profile picture from backend
  const fetchProfilePicture = async () => {
    const userId = getUserId();
    if (!userId) {
      toast.current.show({
        severity: "error",
        summary: "User Not Found",
        detail: "Please log in.",
        life: 3000,
      });
      return;
    }

    setIsLoadingPicture(true);

    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("tempToken");

      if (!token) {
        throw new Error("Authentication token is missing.");
      }

      const url = `${process.env.REACT_APP_BACKEND_URL}/profile/get-profile-picture/${userId}`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { profile_picture_data, profile_picture_mime_type } = response.data;

      // Construct the data URL
      const imageSrc = `data:${profile_picture_mime_type};base64,${profile_picture_data}`;

      setProfileImage(imageSrc);
      cachedProfileImage = imageSrc; // Cache the image
    } catch (error) {
      console.error("Error fetching profile picture:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load profile picture.",
        life: 3000,
      });
      // Optionally, keep the default profile image
    } finally {
      setIsLoadingPicture(false);
    }
  };

  // Function to fetch user profile from backend
  const fetchUserProfile = async () => {
    const userId = getUserId();
    if (!userId) {
      toast.current.show({
        severity: "error",
        summary: "User Not Found",
        detail: "Please log in.",
        life: 3000,
      });
      return;
    }

    setIsLoadingProfile(true);

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/profile/getProfile`,
        {
          headers: {
            Authorization: `Bearer ${
              localStorage.getItem("token") || localStorage.getItem("tempToken")
            }`,
          },
        }
      );

      const { firstName, lastName } = response.data;

      setUserName(`${firstName} ${lastName}`);
      cachedUserProfile = { firstName, lastName }; // Cache the profile
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load user profile.",
        life: 3000,
      });
      setUserName("User"); // Fallback to 'User'
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Combined function to fetch both profile picture and user profile
  const fetchUserData = async () => {
    await Promise.all([fetchProfilePicture(), fetchUserProfile()]);
  };

  useEffect(() => {
    if (!cachedProfileImage || !cachedUserProfile) {
      fetchUserData();
    } else {
      setProfileImage(cachedProfileImage);
      setUserName(
        `${cachedUserProfile.firstName} ${cachedUserProfile.lastName}`
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs once when the component mounts

  useEffect(() => {
    const storedUserType = localStorage.getItem("userType");
    setUserType(parseInt(storedUserType, 10)); // `userType`'ı localStorage'dan al
  }, []);

  return (
    <div style={{ display: "flex" }}>
      <div className={`sidebar ${isExpanded ? "expanded" : "collapsed"}`}>
        <Toast ref={toast} position="top-right" />
        <button
          className="sidebar__toggle"
          onClick={toggleSidebar}
          style={{ marginRight: "15px" }}
        >
          {isExpanded ? "<<" : ">>"}
        </button>
        <div className="sidebar__header">
          <div className="profile-container">
            <div className="profile-picture-wrapper">
              {isLoadingPicture ? (
                <div className="profile-loading">
                  <i
                    className="pi pi-spin pi-spinner"
                    style={{ fontSize: "2em" }}
                  ></i>
                </div>
              ) : (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="profile-picture"
                />
              )}
              {isExpanded && !isLoadingPicture && (
                <button
                  className="refresh-button"
                  onClick={fetchUserData}
                  disabled={isLoadingPicture || isLoadingProfile}
                  title="Refresh Profile and Name"
                >
                  <i className="pi pi-refresh"></i>
                </button>
              )}
            </div>
            {isExpanded && <h2>{userName || "User"}</h2>}
          </div>
        </div>
        {/* Divider */}
        {isExpanded && <div className="sidebar__divider"></div>}

        {isExpanded && <p className="sidebar__dashboard">Dashboard</p>}

        <ul className="sidebar__menu">
<<<<<<< HEAD
          {(userType === 4 || userType === 3 || userType === 2) && (
            <li
              className="menu__item"
              onClick={() => handleNavigation("assign-tour")}
            >
              <i className="pi pi-table"></i>
              {isExpanded && <span>Tour Assignment</span>}
            </li>
          )}
          {(userType === 4 || userType === 3 || userType === 2) && (
            <li
              className="menu__item"
              onClick={() => handleNavigation("guideInfo")}
            >
              <i className="pi pi-info-circle"></i>
              {isExpanded && <span>Guide Info</span>}
            </li>
          )}
          {(userType === 4 || userType === 3 || userType === 2) && (
            <li
              className="menu__item"
              onClick={() => handleNavigation("puantaj-page")}
            >
              <i className="pi pi-calendar"></i>
              {isExpanded && <span>Puantaj Page</span>}
            </li>
          )}
          {(userType === 4 || userType === 3 || userType === 2) && (
            <li
              className="menu__item"
              onClick={() => handleNavigation("approve-tour")}
            >
              <i className="pi pi-check"></i>
              {isExpanded && <span>Tour Approval</span>}
            </li>
          )}
          {userType === 4 && (
            <li
              className="menu__item"
              onClick={() => handleNavigation("data-insight")}
            >
              <i className="pi pi-chart-line"></i>
              {isExpanded && <span>Data Insights</span>}
            </li>
          )}
          {userType === 4 && (
            <li
              className="menu__item"
              onClick={() => handleNavigation("manageUser")}
            >
              <i className="pi pi-user-plus"></i>
              {isExpanded && <span>User Management</span>}
            </li>
          )}
          {(userType === 4 || userType === 3 || userType === 2) && (
            <li
              className="menu__item"
              onClick={() => handleNavigation("realtime-status")}
            >
              <i className="pi pi-clock"></i>
              {isExpanded && <span>Real-time Status</span>}
            </li>
          )}
          {(userType === 4 ||
            userType === 3 ||
            userType === 2 ||
            userType === 1) && (
            <li
              className="menu__item"
              onClick={() => handleNavigation("feedback")}
            >
              <i className="pi pi-comments"></i>
              {isExpanded && <span>Feedback Page</span>}
            </li>
          )}
          {(userType === 4 || userType === 3 || userType === 2) && (
            <li
              className="menu__item"
              onClick={() => handleNavigation("advisors")}
            >
              <i className="pi pi-briefcase"></i>
              {isExpanded && <span>Advisors</span>}
            </li>
          )}
          {(userType === 4 ||
            userType === 3 ||
            userType === 2 ||
            userType === 1) && (
            <li
              className="menu__item"
              onClick={() => handleNavigation("my-tours")}
            >
              <i className="pi pi-map"></i>
              {isExpanded && <span>My Tours</span>}
            </li>
=======
        {(userType === 4 || userType === 3 || userType === 2 || userType === 1) && (
          <li
            className="menu__item"
            onClick={() => handleNavigation("assign-tour")}
          >
            <i className="pi pi-table"></i>
            {isExpanded && <span>Tour Assignment</span>}
          </li>
        )}
        {(userType === 4 || userType === 3 || userType === 2) && (
          <li
            className="menu__item"
            onClick={() => handleNavigation("guideInfo")}
          >
            <i className="pi pi-info-circle"></i>
            {isExpanded && <span>Guide Info</span>}
          </li>
            )}
             {(userType === 4 || userType === 3 || userType === 2) && (
          <li
            className="menu__item"
            onClick={() => handleNavigation("puantaj-page")}
          >
            <i className="pi pi-calendar"></i>
            {isExpanded && <span>Puantaj Page</span>}
          </li>
            )}
             {(userType === 4) && (
          <li
            className="menu__item"
            onClick={() => handleNavigation("approve-tour")}
          >
            <i className="pi pi-check"></i>
            {isExpanded && <span>Tour Approval</span>}
          </li>
           )}
             {userType === 4 && (
          <li
            className="menu__item"
            onClick={() => handleNavigation("data-insight")}
          >
            <i className="pi pi-chart-line"></i>
            {isExpanded && <span>Data Insights</span>}
          </li>
           )}
            {(userType === 4 ) && (
          <li
            className="menu__item"
            onClick={() => handleNavigation("manageUser")}
          >
            <i className="pi pi-user-plus"></i>
            {isExpanded && <span>User Management</span>}
          </li>
            )}
            {(userType === 4 || userType === 3 || userType === 2) && (
          <li
            className="menu__item"
            onClick={() => handleNavigation("RealTimeStatus")}
          >
            <i className="pi pi-clock"></i>
            {isExpanded && <span>Real-time Status</span>}
          </li>
           )}
           {(userType === 4 || userType === 3 || userType === 2 || userType === 1 )&& ( 
          <li
            className="menu__item"
            onClick={() => handleNavigation("feedback")}
          >
            <i className="pi pi-comments"></i>
            {isExpanded && <span>Feedback Page</span>}
          </li>      
>>>>>>> 4da22dd97c86aadab89f12eda8be834d3f85beb5
          )}
          {userType === 4 && (
            <li
              className="menu__item"
              onClick={() => handleNavigation("approve-fair")}
            >
              <i className="pi pi-check-circle"></i>
              {isExpanded && <span>Fair Approval</span>}
            </li>
          )}
          {(userType === 4 || userType === 3 || userType === 2) && (
            <li
              className="menu__item"
              onClick={() => handleNavigation("assign-fair")}
            >
              <i className="pi pi-users"></i>
              {isExpanded && <span>Fair Assignment</span>}
            </li>
          )}
          {(userType === 4 || userType === 3 || userType === 2) && (
            <li
              className="menu__item"
              onClick={() => handleNavigation("individual-tours")}
            >
              <i className="pi pi-user"></i>
              {isExpanded && <span>Individual Tours</span>}
            </li>
          )}
        </ul>
        <div className="sidebar__footer">
          <button
            className="menu__item"
            onClick={() => handleNavigation("Settings")}
          >
            <i className="pi pi-cog"></i>
            {isExpanded && <span>Settings</span>}
          </button>
          <button
            className="menu__item"
            onClick={() => handleNavigation("logout")}
          >
            <i className="pi pi-sign-out"></i>
            {isExpanded && <span>Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
