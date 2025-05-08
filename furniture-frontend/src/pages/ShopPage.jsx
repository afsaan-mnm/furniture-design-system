import React from "react";
import { useNavigate } from "react-router-dom";
import objectImages from "../data/objectImages";
import "../styles/Shop.css";
import bgImage from "../assets/fu-bg.svg"; 
const productPrices = {
  "Bookrack": 45000,
  "Chair1": 46000,
  "Chair2": 47000,
  "coffeetable": 30000,
  "couch02": 31000,
  "gamingchair": 32000,
  "rack2": 55000,
  "sofa1": 56000,
  "soffaaaa": 57000,
};

const Shop = () => {
  const navigate = useNavigate();

  const handleViewProduct = (product) => {
    navigate(`/product/${product.type}`, { state: product });
  };

  return (
    <div
      className="container-fluid py-5"
      style={{
        backgroundColor: "white",
        minHeight: "100vh",
      }}
    >
      {/* Back Button */}
      <div className="mb-3 ms-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="btn btn-dark rounded-circle"
          title="Back to Dashboard"
        >
          ←
        </button>
      </div>

      {/* Title */}
      <h2 className="text-center fw-bold mb-4">Furniture Shop</h2>

      {/* Product Grid */}
      <div className="row justify-content-center px-4">
        {objectImages.map((product) => (
          <div className="col-md-4 mb-4" key={product.type}>
            <div className="card h-100 shadow-sm">
              <img
                src={product.image}
                className="card-img-top"
                alt={product.label}
                style={{ height: "200px", objectFit: "contain" }}
              />
              <div className="card-body d-flex flex-column justify-content-between">
                <h5 className="card-title">{product.label}</h5>
                <p className="card-text text-success fw-semibold">
                  Rs. {productPrices[product.type]?.toLocaleString() || "N/A"}
                </p>
                <button
                  className="btn btn-primary w-100 mt-2"
                  onClick={() => handleViewProduct(product)}
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shop;