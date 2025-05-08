import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../styles/CheckoutPage.css";

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state;

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simulated payment flow
    Swal.fire({
      title: "Payment Successful!",
      text: `Your order for ${product.label} has been placed.`,
      icon: "success",
      confirmButtonText: "OK",
      timer: 3000,
      timerProgressBar: true,
    }).then(() => {
      navigate("/shop");
    });
  };

  if (!product) {
    return (
      <div className="text-center mt-5">
        <h2>No product selected.</h2>
        <button className="btn btn-secondary mt-3" onClick={() => navigate("/shop")}>
          ← Back to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-page d-flex justify-content-center align-items-center">
      <div className="checkout-card shadow p-4 rounded bg-white w-100" style={{ maxWidth: "700px" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <button 
            className="btn btn-outline-secondary" 
            onClick={() => navigate("/shop")}
          >
            ← Back to Shop
          </button>
          <h3 className="fw-bold mb-0 text-center">Checkout</h3>
          <div style={{width: "90px"}}></div> {/* Empty div for balance */}
        </div>

        {/* Product Summary */}
        <div className="text-center mb-4">
          <img src={product.image} alt={product.label} className="img-fluid" style={{ maxHeight: "180px" }} />
          <h5 className="mt-3 fw-bold">{product.label}</h5>
          <p className="text-muted">Code: {product.type}</p>
          <h5 className="text-primary">Total: Rs. {product.price?.toLocaleString() || "9,999"}</h5>
        </div>

        {/* Billing & Payment Form */}
        <form onSubmit={handleSubmit}>
          <h5 className="mb-3">Billing Information</h5>
          <div className="row mb-2">
            <div className="col-md-4 mb-2">
              <input name="name" type="text" className="form-control" placeholder="Full Name" required value={form.name} onChange={handleChange} />
            </div>
            <div className="col-md-4 mb-2">
              <input name="email" type="email" className="form-control" placeholder="Email" required value={form.email} onChange={handleChange} />
            </div>
            <div className="col-md-4 mb-2">
              <input name="phone" type="tel" className="form-control" placeholder="Phone Number" required value={form.phone} onChange={handleChange} />
            </div>
          </div>

          <div className="mb-3">
            <textarea name="address" className="form-control" rows="2" placeholder="Delivery Address" required value={form.address} onChange={handleChange}></textarea>
          </div>

          <h5 className="mb-3">Card Details</h5>
          <div className="mb-2">
            <input name="cardNumber" type="text" className="form-control" placeholder="Card Number" required value={form.cardNumber} onChange={handleChange} />
          </div>
          <div className="row">
            <div className="col mb-2">
              <input name="expiry" type="text" className="form-control" placeholder="MM/YY" required value={form.expiry} onChange={handleChange} />
            </div>
            <div className="col mb-2">
              <input name="cvc" type="text" className="form-control" placeholder="CVC" required value={form.cvc} onChange={handleChange} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 mt-3">
            Place Order
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;