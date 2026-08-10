import appStore from "../../state/appStore";

const ExitMenuIcon = () => (
  <svg
    className="back-to-menu-button__icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M15 3h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-4" />
    <path d="M10 12H3" />
    <path d="M6 9l-3 3 3 3" />
  </svg>
);

const BackToMenuButton = () => (
  <button
    type="button"
    className="back-to-menu-button"
    data-type="back-to-menu"
    onClick={() => appStore.backToMenu()}
    aria-label="В меню"
  >
    <ExitMenuIcon />
  </button>
);

export default BackToMenuButton;
