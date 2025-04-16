import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Tif.css';

import GeoRasterLayer from 'georaster-layer-for-leaflet';
import parseGeoraster from 'georaster';

const position = [21.1458, 79.0882]; // Centered on India
const zoom = 5;

const GeoTiffLayer = ({ file, resetMapView }) => {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    // Clean up previous layer if it exists
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    if (file) {
      const reader = new FileReader();
      reader.onload = async function () {
        const arrayBuffer = reader.result;
        try {
          const georaster = await parseGeoraster(arrayBuffer);

          const newLayer = new GeoRasterLayer({
            georaster,
            opacity: 0.7,
            resolution: 256, // or adjust for quality/performance
          });

          newLayer.addTo(map);
          map.fitBounds(newLayer.getBounds());
          layerRef.current = newLayer;
        } catch (error) {
          console.error("Error parsing GeoTIFF:", error);
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (resetMapView) {
      // Reset to default view when file is removed
      map.setView(position, zoom);
    }

    // Clean up when component unmounts or when file changes
    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [file, map, resetMapView]);

  return null;
};

const FileUploadArea = ({ onFileChange, selectedFile, onFileRemove }) => {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.tif') || file.name.endsWith('.tiff')) {
        onFileChange({ target: { files: [file] } });
      }
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-header">
        <h3>Upload file</h3>
      </div>
      
      <p className="upload-description">
        Upload your <strong>TIF file</strong> to Visualise
        the detailed information of the location.
      </p>
      
      {!selectedFile ? (
        <div 
          className={`upload-area ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            id="file-upload"
            type="file"
            accept=".tif,.tiff"
            onChange={onFileChange}
            className="file-input"
          />
          <label htmlFor="file-upload" className="upload-label">
            Click here or drag file to upload
          </label>
        </div>
      ) : (
        <div className="selected-file-container">
          <div className="selected-file">
            <div className="file-icon">
              <span className="file-type">TIF</span>
            </div>
            <span className="file-name">{selectedFile.name}</span>
          </div>
          <button 
            className="remove-file-btn" 
            onClick={onFileRemove}
            aria-label="Remove file"
          >
            Remove
          </button>
        </div>
      )}
      
      <div className="upload-instructions">
        <p>Note: Only .tif files are allowed</p>
      </div>
    </div>
  );
};

const MapUI = () => {
  const [orthophotoFile, setOrthophotoFile] = useState(null);
  const [resetMapView, setResetMapView] = useState(false);

  const handleFileChange = (event) => {
    setOrthophotoFile(event.target.files[0]);
    setResetMapView(false);
  };

  const handleFileRemove = () => {
    setOrthophotoFile(null);
    setResetMapView(true);
  };

  return (
    <div className="map-ui-container">
      <div className="sidebar">
        <FileUploadArea 
          onFileChange={handleFileChange} 
          selectedFile={orthophotoFile}
          onFileRemove={handleFileRemove}
        />
      </div>

      <div className="map-container">
        <MapContainer center={position} zoom={zoom} style={{ height: '90vh', width: '100%' }}>
          {/* Satellite imagery layer */}
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            
            maxZoom={18}
          />
          {/* Labels layer for hybrid effect */}
          <TileLayer
            url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
            
            maxZoom={18}
            opacity={0.8} // Slightly transparent to let satellite imagery show through
          />
          <GeoTiffLayer 
            file={orthophotoFile} 
            resetMapView={resetMapView} 
          />
        </MapContainer>
      </div>
    </div>
  );
};

export default MapUI;