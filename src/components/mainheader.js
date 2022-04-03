const MainHeader = ({ title, onBackClick, childElements }) => {
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
        {childElements ? childElements : null}
      </div>
    </header>
  );
};

export default MainHeader;
