import React, { useState, useEffect } from "react";
import Map, { Marker, Popup } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin, RefreshCw } from "lucide-react";

// Mock data
const MOCK_LOCATIONS = [
  {
    id: 1,
    name: "Library",
    latitude: 39.925533,
    longitude: 32.866287,
    capacity: 3,
    currentOccupancy: 1,
    status: "empty",
  },
  {
    id: 2,
    name: "B Building",
    latitude: 39.926533,
    longitude: 32.867287,
    capacity: 2,
    currentOccupancy: 2,
    status: "ongoing",
  },
  {
    id: 3,
    name: "Sports Hall",
    latitude: 39.924533,
    longitude: 32.865287,
    capacity: 4,
    currentOccupancy: 0,
    status: "empty",
  },
];

const MOCK_USER_LOCATION = {
  latitude: 39.925533,
  longitude: 32.866287,
};

const RealtimeStatus = () => {
  const [userLocation, setUserLocation] = useState(MOCK_USER_LOCATION);
  const [locations, setLocations] = useState(MOCK_LOCATIONS);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isTourActive, setIsTourActive] = useState(false);
  const [nearbyLocations, setNearbyLocations] = useState([]);
  const [error, setError] = useState("");

  // Get user location
  const getUserLocation = () => {
    /* Uncomment this when ready to use real location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          setError("Location access denied");
        }
      );
    }
    */
    setUserLocation(MOCK_USER_LOCATION); // Using mock for now
  };

  // Calculate distance between points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Update nearby locations
  const updateNearbyLocations = () => {
    const nearby = locations
      .map((location) => ({
        ...location,
        distance: calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          location.latitude,
          location.longitude
        ),
      }))
      .sort((a, b) => a.distance - b.distance)
      .filter((location) => location.distance <= 1000); // Within 1km
    setNearbyLocations(nearby);
  };

  // Initialize
  useEffect(() => {
    getUserLocation();
  }, []);

  // Update nearby locations when user location changes
  useEffect(() => {
    updateNearbyLocations();
  }, [userLocation]);

  const handleStartTour = () => {
    setIsTourActive(true);
    updateNearbyLocations();
  };

  const handleEndTour = () => {
    setIsTourActive(false);
    setSelectedLocation(null);
    // Here you would save tour data to database
  };

  const handleStatusChange = (locationId) => {
    setLocations((prevLocations) =>
      prevLocations.map((location) => {
        if (location.id === locationId) {
          const statusMap = {
            empty: "inline",
            inline: "ongoing",
            ongoing: "empty",
          };
          return {
            ...location,
            status: statusMap[location.status],
            currentOccupancy:
              statusMap[location.status] === "ongoing"
                ? location.currentOccupancy + 1
                : location.currentOccupancy,
          };
        }
        return location;
      })
    );
  };

  const getMarkerColor = (status) => {
    switch (status) {
      case "empty":
        return "#FF4444";
      case "inline":
        return "#FFBB33";
      case "ongoing":
        return "#00C851";
      default:
        return "#757575";
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      {/* Map Container */}
      <div
        style={{
          flex: "1",
          position: "relative",
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          marginRight: "20px",
        }}
      >
        <Map
          mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
          initialViewState={{
            longitude: userLocation.longitude,
            latitude: userLocation.latitude,
            zoom: 15,
          }}
          style={{ width: "100%", height: "70vh" }}
          mapStyle="mapbox://styles/mapbox/streets-v11"
        >
          <Marker
            longitude={userLocation.longitude}
            latitude={userLocation.latitude}
          >
            <MapPin color="#2196F3" size={24} />
          </Marker>

          {locations.map((location) => (
            <Marker
              key={location.id}
              longitude={location.longitude}
              latitude={location.latitude}
              onClick={() => setSelectedLocation(location)}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  backgroundColor: getMarkerColor(location.status),
                  cursor: "pointer",
                  border: "2px solid white",
                }}
              />
            </Marker>
          ))}

          {selectedLocation && (
            <Popup
              longitude={selectedLocation.longitude}
              latitude={selectedLocation.latitude}
              anchor="bottom"
              offset={[0, -20]} // Add offset
              closeButton={true} // Add explicit close button
              closeOnClick={false} // Prevent closing when clicking the map
              style={{ zIndex: 10 }} // Ensure it's above other elements
              onOpen={() => {
                console.log("Rendering popup for point:", selectedLocation);
              }}
              onClose={() => {
                console.log("Closing popup");
                setSelectedLocation(null);
              }}
            >
              <div style={{ padding: "8px", minWidth: "200px" }}>
                {" "}
                {/* Add minimum width */}
                <h3 style={{ fontWeight: "bold", marginBottom: "8px" }}>
                  {selectedLocation.name}
                </h3>
                <p style={{ marginBottom: "4px" }}>
                  Status: {selectedLocation.status}
                </p>
                <p>
                  Occupancy: {selectedLocation.currentOccupancy}/
                  {selectedLocation.capacity}
                </p>
              </div>
            </Popup>
          )}
        </Map>

        {/* Control Buttons Below Map */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "10px",
          }}
        >
          <button
            onClick={isTourActive ? handleEndTour : handleStartTour}
            style={{
              padding: "8px 16px",
              backgroundColor: isTourActive ? "#f44336" : "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {isTourActive ? "End Tour" : "Start Tour"}
          </button>
          <button
            onClick={updateNearbyLocations}
            style={{
              padding: "8px",
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Locations List */}
      <div
        style={{
          flex: "1",
          overflowY: "auto",
          padding: "10px",
          backgroundColor: "#f5f5f5",
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}
      >
        <h2 style={{ marginBottom: "20px", fontSize: "1.2em" }}>
          Nearby Locations
        </h2>
        {nearbyLocations.map((location) => (
          <div
            key={location.id}
            style={{
              backgroundColor: "white",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "6px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3 style={{ marginBottom: "4px", fontSize: "1em" }}>
                  {location.name}
                </h3>
                <p style={{ marginBottom: "2px", fontSize: "0.9em" }}>
                  Distance: {Math.round(location.distance)}m
                </p>
                <p style={{ fontSize: "0.9em" }}>
                  Occupancy: {location.currentOccupancy}/{location.capacity}
                </p>
              </div>
              {isTourActive && (
                <button
                  onClick={() => handleStatusChange(location.id)}
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    backgroundColor: getMarkerColor(location.status),
                    border: "2px solid #757575",
                    cursor: "pointer",
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RealtimeStatus;
