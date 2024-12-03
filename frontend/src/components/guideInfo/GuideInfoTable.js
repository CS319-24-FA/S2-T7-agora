// components/guideInfo/GuideInfoTable.js

import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import './GuideInfoTable.css';
import { fetchGuideSchedule } from '../../services/guideInfoService';

const GuideInfoTable = ({ guides, loading }) => {
    const [downloading, setDownloading] = useState({});

    const downloadSchedule = async (rowData) => {
        if (downloading[rowData.id]) return; // Prevent multiple clicks

        setDownloading((prev) => ({ ...prev, [rowData.id]: true }));

        const scheduleData = await fetchGuideSchedule(rowData.id);

        if (scheduleData && scheduleData.schedule_data) {
            const linkSource = `data:image/jpeg;base64,${scheduleData.schedule_data}`;
            const downloadLink = document.createElement('a');
            const fileName = `${rowData.first_name}_${rowData.last_name}_Schedule.jpg`;

            downloadLink.href = linkSource;
            downloadLink.download = fileName;
            downloadLink.click();
        } else {
            alert('No schedule available for this guide.');
        }

        setDownloading((prev) => ({ ...prev, [rowData.id]: false }));
    };

    const renderDownloadButton = (rowData) => {
        return (
            <button
                onClick={() => downloadSchedule(rowData)}
                className="p-button p-component p-button-text p-button-plain"
            >
                {downloading[rowData.id] ? 'Downloading...' : 'Download Schedule'}
            </button>
        );
    };

    return (
        <div className="guide-info-table">
            <DataTable
                value={guides}
                paginator
                rows={5}
                loading={loading}
                responsiveLayout="scroll"
            >
                <Column
                    field="full_name"
                    header="Full Name"
                    body={(rowData) => `${rowData.first_name} ${rowData.last_name}`}
                    sortable
                    style={{ width: '25%' }}
                />
                <Column field="role" header="Role" sortable style={{ width: '15%' }} />
                <Column field="department" header="Department" sortable style={{ width: '15%' }} />
                <Column field="phone_number" header="Phone" style={{ width: '20%' }} />
                <Column
                    header="Download Schedule"
                    body={renderDownloadButton}
                    style={{ width: '15%' }}
                />
            </DataTable>
        </div>
    );
};

export default GuideInfoTable;
