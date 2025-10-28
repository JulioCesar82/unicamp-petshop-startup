import './styles.css';

export const Header = () => {
  return (
    <header className="header">
      <div className="header-top">
        <div className="header-content">
          <div className="logo">
            <img src="logo01.png" alt="R.E. Rações" className="logo-image" />
          </div>
          
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Procure aqui tudo para seu Pet"
              className="search-input"
            />
            <button className="search-button">
              <i className="fas fa-search"></i>
            </button>
          </div>         
        </div>

        <div className="user-actions">
          <div className="user-greeting">Olá, Marcelo!</div>
          <div className="cart-icon">
            <i className="fas fa-shopping-cart"></i>
          </div>
          <div className="help-icon">
            <i className="fas fa-info-circle"></i>
          </div>
        </div>

      </div>

      <nav className="main-nav">
        <ul>
          <li><a href="#cachorros">Cachorros</a></li>
          <li><a href="#gatos">Gatos</a></li>
          <li><a href="#passaros">Pássaros</a></li>
          <li><a href="#peixes">Peixes</a></li>
          <li><a href="#casa">Casa</a></li>
          <li><a href="#jardim">Jardim</a></li>
          <li><a href="#lojas">Lojas</a></li>
          <li><a href="#blog">Blog</a></li>
          <li><a href="#promocoes">Promoções</a></li>
        </ul>
      </nav>
    </header>
  );
};