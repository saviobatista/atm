import {
  GoogleMap,
  MarkerF,
  useLoadScript,
  HeatmapLayerF,
} from "@react-google-maps/api";
import { NextPage } from "next";
import { useEffect, useMemo, useState } from "react";

const Heatmap: NextPage = () => {
  const [data, setData] = useState<google.maps.LatLng[]>([]);
  useEffect(() => {
    const fetchJson = async () => {
      try {
        const result = await fetch("/heatmap-data-33.json");
        const response = await result.json();
        setData(
          response
            // .slice(0, 2000)
            .map(
              ([coords, amount]) =>
                new google.maps.LatLng(
                  parseFloat(coords.substring(0, coords.indexOf(","))),
                  parseFloat(coords.substring(coords.indexOf(",") + 1))
                )
            )
        );
      } catch (err) {
        console.error(err);
      }
    };
    fetchJson();
  }, []);
  const libraries = useMemo(() => ["visualization"], []);
  const mapCenter = useMemo(
    () => ({ lat: -23.006740688072565, lng: -47.13545520858042 }),
    []
  );
  const mapOptions = useMemo<google.maps.MapOptions>(
    () => ({
      disableDefaultUI: true,
      clickableIcons: true,
      scrollwheel: true,
    }),
    []
  );

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyDEhxoUG1Ycw7V_Qmuez-k2AEROTeeuJ48",
    libraries: libraries as any,
  });

  if (!isLoaded || data.length === 0) return <p>Loading...</p>;

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <GoogleMap
        options={mapOptions}
        zoom={11}
        center={mapCenter}
        mapTypeId={google.maps.MapTypeId.SATELLITE}
        mapContainerStyle={{ width: "100vw", height: "100vh" }}
        onLoad={() => console.log("Map loaded...")}
      >
        <MarkerF position={mapCenter} />
        <HeatmapLayerF data={data} />
        {/* // {markers} */}
      </GoogleMap>
    </div>
  );
};

export default Heatmap;
