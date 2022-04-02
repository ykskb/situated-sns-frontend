import { useRouter } from "next/router";

const Mainside = () => {
  const router = useRouter();
  const handleSearchKeyPress = async (e) => {
    if (e.key === "Enter") {
      router.push(`/search?key=${e.target.value}`);
    }
  };
  return (
    <aside className="main-side">
      <div className="main-side-searchbox">
        <label className="search-box">
          <span className="icon">🔎</span>
          <input
            type="search"
            name="search"
            placeholder="Search"
            onKeyPress={handleSearchKeyPress}
          />
        </label>
      </div>
      <section className="common-box">
        <header className="common-box-header u-flex">
          <h2 className="section-title">Trends for you</h2>
          <button className="icon-button u-margin-start-auto">
            <span className="icon icon-settings">⚙️</span>
          </button>
        </header>
        <ul className="common-list">
          <li className="common-list-item">
            <a className="u-block u-common-padding">
              <div className="trend-category">Web Technology</div>
              <h3 className="common-title">CSS</h3>
              <p>105K Tweets</p>
            </a>
            <button className="icon-button u-flex u-margin-start-auto">
              <span className="icon icon-arrow-down u-margin-auto"></span>
            </button>
          </li>
          <li className="common-list-item">
            <a className="u-block u-common-padding">
              <div className="trend-category">Web Technology</div>
              <h3 className="common-title">SVG</h3>
              <p>21K Tweets</p>
            </a>
            <button className="icon-button u-flex u-margin-start-auto">
              <span className="icon icon-arrow-down u-margin-auto"></span>
            </button>
          </li>
          <li className="common-list-item">
            <a className="u-block u-common-padding">
              <div className="trend-category">Web Technology</div>
              <h3 className="common-title">Responsive Design</h3>
              <p>251K Tweets</p>
            </a>
            <button className="icon-button u-flex u-margin-start-auto">
              <span className="icon icon-arrow-down u-margin-auto"></span>
            </button>
          </li>
        </ul>
        <a className="common-more" href="/">
          Show more
        </a>
      </section>
    </aside>
  );
};
export default Mainside;
