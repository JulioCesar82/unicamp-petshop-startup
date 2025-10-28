import React from "react";
import { Footer } from "../../components/Footer";
import { Header } from "../../components/Header";
import { BookingReminder } from "../../components/BookingReminder";
import "./styles.css";

export const HomePage = () => {
  const [showReminder, setShowReminder] = React.useState(false);

  React.useEffect(() => {
    // Mostrar o modal após 5 segundos
    const timer = setTimeout(() => {
      setShowReminder(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const offers = [
    {
      id: 1,
      title: "15% OFF no pacote com 4 Banhos",
      description: "Aproveite esta promoção por tempo limitado!",
      image: 'banner-01.png',
      buttonText: "Compre agora",
    },
    {
      id: 2,
      title: "60% OFF em produtos selecionados",
      description: "Ofertas até o fim do mês",
      image: 'banner-02.png',
      buttonText: "Ver ofertas",
    }
  ];

  const recommendations = [
    { id: 1, image: 'produto-01.png', name: "Ração Premium", price: 89.90 },
    { id: 2, image: 'produto-02.png', name: "Shampoo Pet", price: 29.90 },
    { id: 3, image: 'produto-03.png', name: "Brinquedo Interativo", price: 45.90 },
    { id: 4, image: 'produto-04.png', name: "Coleira Ajustável", price: 34.90 },
    { id: 5, image: 'produto-05.png', name: "Petisco Natural", price: 19.90 },
  ];

  return (
    <div className="home-page">
      <Header />
      <main className="main-content">
        <div className="carousel">
          {offers.map((offer, index) => (
            <div key={offer.id} className={`carousel-slide ${index === 0 ? 'active' : ''}`}>
              <img src={offer.image} alt={offer.title} />
              <div className="carousel-content">
                <h2>{offer.title}</h2>
                <p>{offer.description}</p>
                <button className="primary-button">{offer.buttonText}</button>
              </div>
            </div>
          ))}
          <div className="carousel-indicators">
            {offers.map((_, index) => (
              <button 
                key={index} 
                className={`indicator ${index === 0 ? 'active' : ''}`}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <section className="recommendations">
          <h2>Produtos recomendados</h2>
          <div className="products-grid">
            {recommendations.map(product => (
              <div key={product.id} className="product-card">
                <img src={product.image} alt={product.name} />
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="price">R$ {product.price.toFixed(2)}</p>
                  <button className="add-to-cart">Adicionar ao carrinho</button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
      <Footer />
      
      {showReminder && (
        <BookingReminder
          onClose={() => setShowReminder(false)}
          onSchedule={() => {
            // Não fechamos o modal aqui para permitir que o fluxo de agendamento seja mostrado
            console.log('Iniciando fluxo de agendamento...');
          }}
        />
      )}
    </div>
  );
};