import React from 'react';
import Slider from 'react-slick';
import { useNavigate } from 'react-router-dom';

// Impor CSS wajib untuk react-slick
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

// Komponen untuk panah custom (agar sesuai desain)
const NextArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} custom-arrow next-arrow`}
      onClick={onClick}
    />
  );
}

const PrevArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} custom-arrow prev-arrow`}
      onClick={onClick}
    />
  );
}

const CarSlider = ({ topCars }) => {
  const navigate = useNavigate();

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />
  };

  return (
    <div className="slider-container">
      <Slider {...settings}>
        {topCars.map(car => (
          <div key={car.mobil_id} className="slide-item" onClick={() => navigate(`/cars/${car.mobil_id}`)}>
            <img 
              src={car.gambar.startsWith('http') ? car.gambar : `http://localhost:8002/storage/${car.gambar}`} 
              alt={car.nama} 
              className="slider-image"
            />
            {/* Anda bisa menambahkan info mobil di atas gambar jika mau */}
            {/* <div className="slide-caption">
              <h3>{car.nama}</h3>
            </div> */}
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default CarSlider;