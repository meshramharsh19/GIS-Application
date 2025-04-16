import React, { useState, useRef } from 'react';
import MapComponent from './MapComponent';
import FileUploader from './FileUploader';
import ErrorBoundary from './ErrorBoundary';
import tokml from "tokml";

const KML = () => {
  const [kmlData, setKmlData] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const fileInputRef = useRef(null);
  const drawnItemsRef = useRef(null);

  // Get file upload functionality from FileUploader
  const { handleFileChange } = FileUploader({
    onFileUpload: (data) => {
      setKmlData(data);
      setImageUrl(null); // Reset image URL if needed
    }
  });

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleDownloadKML = () => {
    if (!drawnItemsRef.current) return;

    const allGeoJSON = drawnItemsRef.current.toGeoJSON();

    // Filter only LineString, Polygon (i.e., border-type shapes)
    const filtered = {
      type: "FeatureCollection",
      features: allGeoJSON.features.filter((f) =>
        ["Polygon", "LineString"].includes(f.geometry.type)
      ),
    };

    if (filtered.features.length === 0) {
      alert("No polygon or line drawn to export.");
      return;
    }

    const kml = tokml(filtered);

    const blob = new Blob([kml], {
      type: "application/vnd.google-earth.kml+xml",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "boundary.kml";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <ErrorBoundary>
      <div style={{ padding: '20px' }}>
        <h1>KML File Uploader and Map Viewer</h1>

        {/* Styled file upload area */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            accept=".kml"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <div
            onClick={triggerFileInput}
            style={{
              border: '2px dashed #2196f3',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              borderRadius: '4px',
              width: '300px',
              height: '45px',
              color: '#2196f3',
              fontWeight: 'bold'
            }}
          >
            <span>Click here or drag file to upload</span>
          </div>
        </div>

      

        <div style={{ height: '72vh' }}>
          <MapComponent
            kmlData={kmlData}
            imageUrl={imageUrl}
            setDrawnItemsRef={(ref) => drawnItemsRef.current = ref}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default KML;