import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./UserManagementPage.css"; // Include CSS for styling
import Sidebar from "../components/common/Sidebar";
import { MultiSelect } from "primereact/multiselect"; // Import MultiSelect component
import { Toast } from "primereact/toast"; // Import Toast
import '../components/common/CommonComp.css';

const daysOptions = [
    { label: "Monday", value: "Monday" },
    { label: "Tuesday", value: "Tuesday" },
    { label: "Wednesday", value: "Wednesday" },
    { label: "Thursday", value: "Thursday" },
    { label: "Friday", value: "Friday" },
    { label: "Weekend", value: "Weekend" },
];

const UserManagementPage = () => {
    const [action, setAction] = useState("register"); // Default to "register"
    const [advisors, setAdvisors] = useState([]); // List of advisors
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        department: "",
        role: "",
        phone_number: "",
        crew_no: "",
        advisor_name: "",
        days: [],
    });
    const [error, setError] = useState("");
    const toast = useRef(null); // Create a ref for Toast

    // Replace this with your method of getting the current user's email
    const currentUserEmail = localStorage.getItem("email") || "current.user@example.com";

    // Fetch advisors on component mount
    useEffect(() => {
        const fetchAdvisors = async () => {
            try {
                const response = await axios.get("http://localhost:3001/user-management/advisors");
                setAdvisors(response.data);
            } catch (error) {
                console.error("Error fetching advisors:", error);
            }
        };
        fetchAdvisors();
    }, []);

    const handleActionChange = (e) => {
        setAction(e.target.value);
        resetForm();
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setFormData({
            first_name: "",
            last_name: "",
            email: "",
            department: "",
            role: "",
            phone_number: "",
            crew_no: "",
            advisor_name: "",
            days: [],
        });
        setError("");
    };

    // Form submission handlers
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:3001/auth/register", formData);
            toast.current.clear();
            toast.current.show({
                severity: "success",
                summary: "Success",
                detail: response.data.message,
                life: 3000,
            });
            resetForm();
        } catch (error) {
            console.error("Error during registration:", error);
            toast.current.clear();
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: error.response?.data?.message || "An error occurred while registering.",
                life: 3000,
            });
        }
    };

    const handleRemoveUserSubmit = async (e) => {
        e.preventDefault();

        // Prevent removing self
        if (formData.email === currentUserEmail) {
            toast.current.clear();
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "You cannot remove your own account.",
                life: 3000,
            });
            return;
        }

        try {
            const response = await axios.post("http://localhost:3001/user-management/remove", {
                email: formData.email,
            });
            toast.current.clear();
            toast.current.show({
                severity: "success",
                summary: "Success",
                detail: response.data.message,
                life: 3000,
            });
            resetForm();
        } catch (error) {
            console.error("Error removing user:", error);
            toast.current.clear();
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: error.response?.data?.message || "An error occurred while removing the user.",
                life: 3000,
            });
        }
    };

    const handleChangeRoleSubmit = async (e) => {
        e.preventDefault();
        // Check if the user is trying to change their own role
        if (formData.email === currentUserEmail) {
            toast.current.clear();
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "You cannot change your own user role.",
                life: 3000,
            });
            return;
        }

        try {
            const response = await axios.post("http://localhost:3001/user-management/changeRole", {
                email: formData.email,
                new_role: formData.role,
                days: formData.days,
            });
            toast.current.clear();
            toast.current.show({
                severity: "success",
                summary: "Success",
                detail: response.data.message,
                life: 3000,
            });
            resetForm();
        } catch (error) {
            console.error("Error changing role:", error);
            toast.current.clear();
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: error.response?.data?.message || "An error occurred while changing the role.",
                life: 3000,
            });
        }
    };

    const handleUpdateCrewNoSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:3001/user-management/updateCrewNo", {
                email: formData.email,
                crew_no: formData.crew_no,
            });
            toast.current.clear();
            toast.current.show({
                severity: "success",
                summary: "Success",
                detail: response.data.message,
                life: 3000,
            });
            resetForm();
        } catch (error) {
            console.error("Error updating crew number:", error);
            toast.current.clear();
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: error.response?.data?.message || "An error occurred while updating the crew number.",
                life: 3000,
            });
        }
    };

    return (
        <div>
            <Sidebar />
            <div className="user-management-container">
              <Toast ref={toast} /> {/* Add Toast Component */}
              <div className="user-management-content">
                <h1>User Management</h1>
                <div className="action-selector">
                    <label>Select Action:</label>
                    <select value={action} onChange={handleActionChange}>
                        <option value="register">Register</option>
                        <option value="changeStatus">Change Status</option>
                        <option value="removeByEmail">Remove User</option>
                        <option value="updateCrewNo">Update Crew No</option>
                    </select>
                </div>

                {action === "register" && (
                    <div className="form-container">
                        <h2>Register New User</h2>
                        <form onSubmit={handleRegisterSubmit}>
                            <div className="form-group">
                                <label>First Name:</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Last Name:</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email:</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Role:</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={(e) => {
                                        const selectedRole = e.target.value;
                                        setFormData((prevFormData) => ({
                                            ...prevFormData,
                                            role: selectedRole,
                                            days: selectedRole === "advisor" ? [] : prevFormData.days,
                                            advisor_name: selectedRole === "candidate guide" ? "" : prevFormData.advisor_name,
                                        }));
                                    }}
                                    required
                                >
                                    <option value="">Select Role</option>
                                    <option value="candidate guide">Candidate Guide</option>
                                    <option value="advisor">Advisor</option>
                                    <option value="guide">Guide</option>
                                    <option value="coordinator">Coordinator</option>
                                </select>
                            </div>

                            {formData.role === "advisor" && (
                                <div className="form-group">
                                    <label>Available Days:</label>
                                    <MultiSelect
                                        value={formData.days}
                                        options={daysOptions}
                                        onChange={(e) => setFormData({ ...formData, days: e.value })}
                                        placeholder="Select Days"
                                        display="chip"
                                        required
                                    />
                                </div>
                            )}
                            {formData.role === "candidate guide" && (
                                <div className="form-group">
                                    <label>Select Advisor:</label>
                                    <select
                                        name="advisor_name"
                                        value={formData.advisor_name}
                                        onChange={(e) => setFormData({ ...formData, advisor_name: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Advisor</option>
                                        {advisors.map((advisor) => (
                                            <option key={advisor.user_id} value={advisor.full_name}>
                                                {advisor.full_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <button type="submit">Register</button>
                        </form>
                    </div>
                )}

                {action === "removeByEmail" && (
                    <div className="form-container">
                        <h2>Remove User by Email</h2>
                        <form onSubmit={handleRemoveUserSubmit}>
                            <div className="form-group">
                                <label>Email:</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <button type="submit">Remove User</button>
                        </form>
                    </div>
                )}

                {action === "changeStatus" && (
                    <div className="form-container">
                        <h2>Change User Status</h2>
                        <form onSubmit={handleChangeRoleSubmit}>
                            <div className="form-group">
                                <label>Email:</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>New Role:</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={(e) => {
                                        const selectedRole = e.target.value;
                                        setFormData((prevFormData) => ({
                                            ...prevFormData,
                                            role: selectedRole,
                                            days: selectedRole === "advisor" ? [] : prevFormData.days,
                                            crew_no: selectedRole === "coordinator" ? 1 : prevFormData.crew_no,
                                        }));
                                    }}
                                    required
                                >
                                    <option value="">Select Role</option>
                                    <option value="advisor">Advisor</option>
                                    <option value="guide">Guide</option>
                                    <option value="coordinator">Coordinator</option>
                                </select>
                            </div>

                            {formData.role === "advisor" && (
                                <div className="form-group">
                                    <label>Select Available Days:</label>
                                    <MultiSelect
                                        value={formData.days}
                                        options={daysOptions}
                                        onChange={(e) => setFormData({ ...formData, days: e.value })}
                                        placeholder="Select Days"
                                        display="chip"
                                        required
                                    />
                                </div>
                            )}
                            <button type="submit">Change Status</button>
                        </form>
                    </div>
                )}

                {action === "updateCrewNo" && (
                    <div className="form-container">
                        <h2>Update Crew No</h2>
                        <form onSubmit={handleUpdateCrewNoSubmit}>
                            <div className="form-group">
                                <label>Email:</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Crew No:</label>
                                <input
                                    type="text"
                                    name="crew_no"
                                    value={formData.crew_no}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <button type="submit">Update Crew No</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
        </div>
    );
};

export default UserManagementPage;
