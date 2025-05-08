import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import objectImages from "../data/objectImages";
import "../styles/ProductPage.css";

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const product = objectImages.find((p) => p.type === id);

  if (!product) {
    return (
      <div className="product-not-found text-center mt-5">
        <h2 className="text-danger">Product Not Found</h2>
        <button className="btn btn-secondary mt-4" onClick={() => navigate("/shop")}>
          ← Back to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="container product-detail-page py-5">
      <div className="row align-items-center shadow-lg rounded p-4 bg-white">
        <div className="col-lg-6 col-12 text-center mb-4 mb-lg-0">
          <img
            src={product.image}
            alt={product.label}
            className="img-fluid rounded product-image"
            style={{ maxHeight: "350px" }}
          />
        </div>

        <div className="col-lg-6 col-12">
          <h2 className="fw-bold">{product.label}</h2>
          <p className="text-muted small">Type Code: {product.type}</p>

          <h4 className="text-success fw-bold mb-3">Rs. {product.price?.toLocaleString() || "9,999.00"}</h4>

          <p className="mb-4 text-secondary">
            Bring elegance to your space with this premium furniture item. Preview it in 2D or 3D before purchase or buy it instantly with secure checkout.
          </p>

          <div className="d-flex flex-wrap gap-3 mb-4">
            <button
              className="btn btn-primary px-4"
              onClick={() => navigate("/checkout", { state: product })}
            >
              Buy Now
            </button>
            <button className="btn btn-outline-success" onClick={() => navigate("/create-design")}>
              View in 2D Design
            </button>
            <button className="btn btn-outline-info" onClick={() => navigate("/design3d")}>
              View in 3D Design
            </button>
          </div>

          <button
            className="btn btn-link text-decoration-none"
            onClick={() => navigate("/shop")}
          >
            ← Back to Shop
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;