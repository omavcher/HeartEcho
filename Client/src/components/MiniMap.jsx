import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = "pk.eyJ1Ijoib21hd2NoYXIwNyIsImEiOiJjbHlmbGtwdmowMHhkMmtxeXAyNXdkeHB3In0.37j_dk9NgxtiPXqwCgsdQg";

function MiniMap({ coords }) {
  const mapContainer = useRef(null);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11", // ✅ Changed to Dark Mode
      center: coords,
      zoom: 10,
    });

    new mapboxgl.Marker().setLngLat(coords).addTo(map);

    return () => map.remove();
  }, [coords]);

  return <div className="mini-map" ref={mapContainer}></div>;
}

export default MiniMap;
