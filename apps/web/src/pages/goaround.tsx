import {
  CircleF,
  GoogleMap,
  InfoWindowF,
  Marker,
  MarkerF,
  PolylineF,
  useLoadScript,
} from "@react-google-maps/api";
import { NextPage } from "next";
import { useEffect, useMemo, useState } from "react";

const getColorByAltitude = (altitude: number): string => {
  if (altitude < 2800) return "#00FF00";
  if (altitude < 4000) return "#CCCC00";
  return "#FF0000";
};
const Heatmap: NextPage = () => {
  // const [data, setData] = useState<google.maps.LatLngAltitude[]>([]);
  const [data, setData] = useState<
    { lat: number; lon: number; alt: number }[][]
  >([]);
  const [aircrafts, setAircrafts] = useState<
    { modes: string; type: string; registration: string }[]
  >([]);
  const [markers, setMarkers] = useState<
    { hex: string; lon: number; lat: number; alt: number; date: string }[]
  >([]);
  const getAircraftByHex = (
    hex: string
  ): { type: string; registration: string } => {
    for (const obj of aircrafts) {
      if (obj.modes == hex) {
        return obj;
      }
    }
    console.log("NAO ACHEI", hex);
    return { type: "-", registration: "-" };
    // const { type, registration } = aircrafts.find((aircraft) => {
    //   aircraft.modes === hex;
    // }) || { type: "?", registration: "?" };
    // return { type, registration };
  };
  useEffect(() => {
    const fetchJson = async () => {
      try {
        const r3 = await fetch("/markers-ga15.json");
        setMarkers(await r3.json());
        const r2 = await fetch("/aircrafts.json");
        setAircrafts(await r2.json());
        const result = await fetch("/heatmap-ga15.json");
        const response: { lat: number; lon: number; alt: number }[][] =
          await result.json();
        setData(response);
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

  if (
    !isLoaded ||
    aircrafts.length == 0 ||
    markers.length == 0 ||
    data.length == 0
  )
    return <p>Loading...</p>;
  const showInfo = (idx: number) => {
    const { hex, lon, lat, alt, date } = markers[idx];
    const { registration, type } = getAircraftByHex(hex);
    const d = new Date(date).toLocaleDateString("pt-BR");
    const title = `${registration} (${type}) @ ${alt} - ${d}`;
    alert(title);
  };
  return (
    <div style={{ width: "99vw", height: "98vh" }}>
      <GoogleMap
        options={mapOptions}
        zoom={11}
        center={mapCenter}
        mapTypeId={google.maps.MapTypeId.SATELLITE}
        mapContainerStyle={{ width: "99vw", height: "98vh" }}
        onLoad={() => console.log("Map loaded...")}
      >
        {/* <MarkerF position={mapCenter} /> */}
        {/* <HeatmapLayerF data={data} /> */}

        {markers.map(({ hex, lon, lat, alt, date }, idx) => {
          const { registration, type } = getAircraftByHex(hex);
          const d = new Date(date).toLocaleDateString("pt-BR");
          const title = `${registration} (${type}) @ ${alt} - ${d}`;
          return (
            <MarkerF
              key={`mark-${idx}`}
              position={{ lat, lng: lon }}
              title={title}
              // onLoad={(marker) => {
              //   console.log(marker.getIcon());
              //   const customIcon = (opts) =>
              //     Object.assign(
              //       {
              //         path: "M7.8,1.3L7.8,1.3C6-0.4,3.1-0.4,1.3,1.3c-1.8,1.7-1.8,4.6-0.1,6.3c0,0,0,0,0.1,0.1 l3.2,3.2l3.2-3.2C9.6,6,9.6,3.2,7.8,1.3C7.9,1.4,7.9,1.4,7.8,1.3z M4.6,5.8c-0.7,0-1.3-0.6-1.3-1.4c0-0.7,0.6-1.3,1.4-1.3 c0.7,0,1.3,0.6,1.3,1.3 C5.9,5.3,5.3,5.9,4.6,5.8z",
              //         fillColor: "#f00",
              //         fillOpacity: 1,
              //         strokeColor: "#000",
              //         strokeWeight: 1,
              //         scale: 3.5,
              //       },
              //       opts
              //     );

              //   marker.setIcon(
              //     customIcon({
              //       fillColor: getColorByAltitude(alt),
              //       strokeColor: "white",
              //     })
              //   );
              // }}
            />
          );
        })}
        {data.map((paths, idx) => (
          <PolylineF
            key={idx}
            path={paths.map(({ lat, lon }) => ({ lat, lng: lon }))}
            options={{ strokeColor: getColorByAltitude(markers[idx].alt) }}
            onClick={() => showInfo(idx)}
          />
          // <CircleF
          //   key={`p${idx}`}
          //   center={{ lat, lng: lon }}
          //   radius={1}
          //   options={{
          //     fillColor: getColorByAltitude(alt),
          //     fillOpacity: 1,
          //     strokeColor: getColorByAltitude(alt),
          //   }}
          // />
        ))}
      </GoogleMap>
    </div>
  );
};

export default Heatmap;
