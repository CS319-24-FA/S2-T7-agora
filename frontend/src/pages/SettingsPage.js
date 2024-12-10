import React, { useState, useContext } from 'react';
import Sidebar from '../components/common/Sidebar';
import ProfileSettings from '../components/settings/ProfileSettings';
import ChangePassword from '../components/settings/ChangePassword';
import About from '../components/settings/About';
import HelpSupport from '../components/settings/HelpSupport';
import Uploads from '../components/settings/Uploads'; // Import the Uploads component

import { AuthContext } from '../context/AuthContext';
import './SettingsPage.css';

const SettingsPage = () => {
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

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            {/* Main Application Sidebar */}
            <Sidebar setCurrentPage={() => {}} />

            {/* Settings Page Content */}
            <div className="settings-page-container">
                {/* Settings Sidebar */}
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
                <div className="settings-content">{renderContent()}</div>
            </div>
        </div>
    );
};

export default SettingsPage;
