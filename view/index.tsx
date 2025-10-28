import React from "react";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import carrosel from "./carrosel.png";
import product01 from "./product-01.png";
import product02 from "./product-02.png";
import product03 from "./product-03.png";
import product04 from "./product-04.png";
import product05 from "./product-05.png";
import "./style.css";

export const HomePage = () => {
  return (
    <div className="home-page">
      <Header />
      <div className="body">
        <img className="carrosel" alt="Carrosel" src={carrosel} />

        <div className="products">
          <img className="product" alt="Product" src={product05} />

          <img className="product-2" alt="Product" src={product04} />

          <img className="product-3" alt="Product" src={product03} />

          <img className="product-4" alt="Product" src={product02} />

          <img className="product-5" alt="Product" src={product01} />

          <div className="text-wrapper-19">Produtos recomendados</div>
        </div>
      </div>

      <Footer />
    </div>
  );
};