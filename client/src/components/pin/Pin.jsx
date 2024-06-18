import { Marker, Popup } from "react-leaflet";
import "./pin.scss";
import { Link } from "react-router-dom";

function Pin({ item }) {
  const { latitude, longitude, images, id, title, bedroom, price } = item;

  if (!latitude || !longitude) {
    console.error(`Item with ID ${id} is missing latitude or longitude`);
    return null;
  }

  return (
    <Marker position={[latitude, longitude]}>
      <Popup>
        <div className="popupContainer">
          {images && images.length > 0 ? (
            <img src={images[0]} alt="" />
          ) : (
            <div className="noImage">No Image Available</div>
          )}
          <div className="textContainer">
            <Link to={`/${id}`}>{title}</Link>
            <span>{bedroom} bedroom</span>
            <b>{price} TZS</b>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

export default Pin;
