import { MapContainer, TileLayer } from "react-leaflet";
import "./map.scss";
import "leaflet/dist/leaflet.css";
import Pin from "../pin/Pin";

function Map({ items }) {
  let center;
  let pins;

  // Determine center and pins based on the structure of items
  if (Array.isArray(items)) {
    // ListPage functionality: items is an array of items
    center = items.length === 1 ? [items[0].location.latitude, items[0].location.longitude] : [-6.816583703268045, 39.157425104596975];
    pins = items.map(item => <Pin item={item.location} key={item.id} />);
  } else {
    // SinglePage functionality: items is a single item
    center = [items.location.latitude, items.location.longitude];
    pins = <Pin item={items.location} key={items.id} />;
  }


  return (
    <MapContainer
      center={center}
      zoom={7}
      scrollWheelZoom={false}
      className="map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pins}
    </MapContainer>
  );
}

export default Map;
