import { log } from "console";
import { writeFileSync } from "fs";
import { create } from "xmlbuilder2";
import { SBKP } from "../ad/sbkp";
import { Aircraft } from "../types";

const color: string[] = [
  "FF0000FF",
  "FF7F00FF",
  "FFFF00FF",
  "00FF00FF",
  "0000FFFF",
  "2E2B5FFF",
  "8B00FFFF",
  "FFFFFFFF",
  "000000FF",
  "778899FF",
  "008080FF",
];
const toKML = async (database: Map<string, Aircraft>): Promise<void> => {
  log(`Generating KML files...`);
  for (const [hex, aircraft] of database) {
    for (const flight of aircraft.flights) {
      const title = `${flight.date} ${flight.time} ${flight.callsign} ${flight.origin} ${flight.destination}`;
      const file = `tmp/${flight.date}_${flight.time}_${flight.callsign}_${flight.origin}_${flight.destination}.kml`;
      var kml = create({ version: "1.0", encoding: "UTF-8" });
      kml = kml
        .ele("kml", { xmlns: "http://www.opengis.net/kml/2.2" })
        .ele("Document")
        .ele("name")
        .txt(title)
        .up()
        .ele("description")
        .txt("Exemplo de navegação do voo")
        .up()
        .ele("Style", { id: "voo" })
        .ele("LineStyle")
        .ele("color")
        .txt("FF0000FF")
        .up()
        .ele("width")
        .txt("10")
        .up()
        .up()
        .up();
      //Colors
      for (const idx in color) {
        kml = kml
          .ele("Style", { id: `cor${parseInt(idx) % color.length}` })
          .ele("LineStyle")
          .ele("color")
          .txt(color[idx])
          .up()
          .ele("width")
          .txt("4")
          .up()
          .up()
          .up();
      }
      kml = kml
        .ele("Placemark")
        .ele("name")
        .txt("Radar Viracopos")
        .up()
        .ele("Point")
        .ele("coordinates")
        .txt("-47,1455363,-23,0109027,644")
        .up()
        .up()
        .up()
        .ele("Placemark")
        .ele("name")
        .txt("RWY 15-33")
        .up()
        .ele("Polygon")
        .ele("extrude")
        .txt("1")
        .up()
        .ele("outerBoundaryIs")
        .ele("LinearRing")
        .ele("coordinates")
        .txt(
          "-47.146876,-22.998268 -47.147161,-22.99861 -47.122126,-23.016567 -47.121822,-23.016202 -47.146876,-22.998268"
        )
        .up()
        .up()
        .up()
        .up()
        .up()
        .ele("Placemark")
        .ele("name")
        .txt(`Flight ${title}`)
        .up()
        .ele("styleUrl")
        .txt(`#cor0`)
        .up()
        .ele("LineString")
        .ele("tessellate")
        .txt("1")
        .up()
        .ele("altitudeMode")
        .txt("relativeToGround")
        .up()
        .ele("coordinates")
        .txt(
          flight.path
            .map<string>((e) => `${e.longitude},${e.latitude}`)
            .join(" ")
        )
        .up()
        .up()
        .up();
      for (const idx in SBKP.points) {
        kml = kml
          .ele("Placemark")
          .ele("name")
          .txt(SBKP.points[idx].label)
          .up()
          .ele("Point")
          .ele("coordinates")
          .txt(SBKP.points[idx].position)
          .up()
          .up()
          .up();
      }

      for (const [label] of SBKP.taxiways) {
        const data = flight.geo.get(label);
        if (data) {
          kml = kml
            .ele("Placemark")
            .ele("name")
            .txt(`${label} aqui`)
            .up()
            .ele("Point")
            .ele("coordinates")
            .txt(`${data.longitude},${data.latitude}`)
            .up()
            .up()
            .up();
        }
      }
      for (const { label } of SBKP.points) {
        const data = flight.geo.get(label);
        if (data) {
          kml = kml
            .ele("Placemark")
            .ele("name")
            .txt(`${label} aqui`)
            .up()
            .ele("Point")
            .ele("coordinates")
            .txt(`${data.longitude},${data.latitude}`)
            .up()
            .up()
            .up();
        }
      }
      const content = kml.end({ prettyPrint: true });
      writeFileSync(file, content);
    }
  }
};
export default toKML;
