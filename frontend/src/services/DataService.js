export const fetchTourData = async (filter, periodIndex) => {
  try {
    const response = await fetch(`http://localhost:3001/data/${filter}/${periodIndex}`);
    if (!response.ok) {
      throw new Error("Failed to fetch tour data");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching tour data:", error);
    throw error;
  }
};

export const fetchSchoolStudentData = async (year) => { // Ensure 'year' is required
  try {
    const response = await fetch(`http://localhost:3001/data/yearly/${year}`); // Correct endpoint
    if (!response.ok) {
      throw new Error("Failed to fetch school student data");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching school student data:", error);
    throw error;
  }
};
