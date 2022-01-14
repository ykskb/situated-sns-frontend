const MainHeader = ({ title, onBackClick }) => {
  return (
    <header className="main-header">
      {typeof onBackClick === "function" ? (
        <button
          className="icon-button icon-back js-home"
          onClick={(e) => {
            onBackClick(e);
          }}
        >
          <span className="icon">←</span>
        </button>
      ) : null}
      <div className="main-header-content">
        <h1 className="section-title js-title">{title}</h1>
      </div>
    </header>
  );
};

export default MainHeader;
