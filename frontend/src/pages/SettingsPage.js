// SettingsPage.jsx

import React, { useState, useContext } from 'react';
import Sidebar from '../components/common/Sidebar';
import ProfileSettings from '../components/settings/ProfileSettings';
import ChangePassword from '../components/settings/ChangePassword';
import About from '../components/settings/About';
import HelpSupport from '../components/settings/HelpSupport';
import Uploads from '../components/settings/Uploads'; // Import the Uploads component
import useProtectRoute from "../hooks/useProtectRoute";
import Unauthorized from "./Unauthorized";

import { AuthContext } from '../context/AuthContext';
import './SettingsPage.css';

const SettingsPage = () => {
    const isAuthorized = useProtectRoute([1,2,3,4]); // Check authorization
    const [activeTab, setActiveTab] = useState('account'); // Default to account view
    const { user } = useContext(AuthContext);

    const userEmail = user?.email;
    const userType = user?.user_type;

    const renderContent = () => {
        const isInnerCardRequired = ['changePassword', 'appearance', 'helpSupport'].includes(activeTab);

        return (
            <div className={isInnerCardRequired ? 'inner-card' : ''}>
                {(() => {
                    switch (activeTab) {
                        case 'account':
                            return <ProfileSettings userEmail={userEmail} userType={userType} />;
                        case 'changePassword':
                            return <ChangePassword userEmail={userEmail} />;
                        case 'helpSupport':
                            return <HelpSupport />;
                        case 'about':
                            return <About />;
                        case 'uploads':
                            return <Uploads />; // Render the Uploads component
                        default:
                            return <div>Select a settings option</div>;
                    }
                })()}
            </div>
        );
    };

    if (!isAuthorized) {
        return <Unauthorized />;
    }
    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <Sidebar setCurrentPage={() => {}} />

            <div className="settings-page-container">
                <div className="settings-sidebar">
                    <h2 className="settings-header">Settings</h2>
                    <button
                        className={activeTab === 'account' ? 'active-tab' : ''}
                        onClick={() => setActiveTab('account')}
                    >
                        <i className="pi pi-user"></i> Account
                    </button>
                    <button
                        className={activeTab === 'changePassword' ? 'active-tab' : ''}
                        onClick={() => setActiveTab('changePassword')}
                    >
                        <i className="pi pi-key"></i> Change Password
                    </button>
                
                    <button
                        className={activeTab === 'helpSupport' ? 'active-tab' : ''}
                        onClick={() => setActiveTab('helpSupport')}
                    >
                        <i className="pi pi-headphones"></i> Help and Support
                    </button>
                    <button
                        className={activeTab === 'about' ? 'active-tab' : ''}
                        onClick={() => setActiveTab('about')}
                    >
                        <i className="pi pi-info-circle"></i> About
                    </button>
                    <button
                        className={activeTab === 'uploads' ? 'active-tab' : ''}
                        onClick={() => setActiveTab('uploads')}
                    >
                        <i className="pi pi-upload"></i> Uploads
                    </button>
                </div>

                {/* Settings Main Content */}
                <div
                    className={`settings-content ${activeTab === 'account' || 'uploads' ? 'column-direction' : ''}`}
                >
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
