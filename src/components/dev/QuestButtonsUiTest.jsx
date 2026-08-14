import appStore from "../../state/appStore";
import { QuestCtaButton } from "../ui/QuestCtaButton";
import "../../style/quest-buttons-ui-test.css";
const MISSION_BUTTONS = [
  { id: "arrest", text: "Арестовать", context: "Полицейский квест" },
  { id: "block", text: "Блокировать", context: "Карта / погоня" },
  { id: "fine", text: "Выписать штраф", context: "Пешеходный квест" },
];

const NAV_BUTTONS = [
  { id: "continue", text: "Продолжить", context: "Quest finish" },
  { id: "to-menu", text: "В меню", context: "Результат режима" },
  { id: "watch-video", text: "Смотреть видео", context: "Заправка" },
];

/** Без рамок — форма и свет вместо border/outline */
const BORDERLESS_VARIANTS = [
  {
    id: "aurora",
    name: "Soft Aurora",
    tagline: "Мягкие капсулы, градиент + рассеянное свечение",
    description:
      "Контур задаёт только цветной bloom снаружи. Mission — тёплый красный с синим ореолом. Nav — холодный синий градиент, одинаковый для всех трёх.",
    diff: "Воздушный, «ночной патруль». Никаких stroke.",
  },
  {
    id: "bloom",
    name: "Siren Bloom",
    tagline: "Свет изнутри — radial glow вместо обводки",
    description:
      "Кнопка как лампа маячка: яркий центр, мягкое затухание к краям. Mission — красно-синий dual-tone. Nav — единый холодный луч.",
    diff: "Максимально «сирена без рамки». Хорош на тёмном фоне.",
  },
  {
    id: "chunk",
    name: "Toy Chunk",
    tagline: "Плоская заливка + объёмная тень (3D-нажатие)",
    description:
      "Детская игрушечная физика: толстый нижний shadow-layer, без border. Mission — красный блок. Nav — синий блок, один стиль.",
    diff: "Самый тактильный. Читается даже без glow.",
  },
  {
    id: "mist",
    name: "Fog Beam",
    tagline: "Полупрозрачная дымка + цветной луч снизу",
    description:
      "Стеклянная кнопка без контура: blur + цветной underglow снизу. Mission — красный луч. Nav — синий луч, единый для всех.",
    diff: "Лёгкий, не перекрывает игру. Для модалок и HUD.",
  },
];

export function QuestButtonsUiTest() {
  return (
    <div className="quest-buttons-ui-test" data-type="quest-buttons-ui-test">
      <header className="quest-buttons-ui-test__header">
        <div>
          <h1 className="quest-buttons-ui-test__title">Кнопки без рамок</h1>
          <p className="quest-buttons-ui-test__subtitle">
            4 новых направления · mission + nav (единый nav) · border: none
          </p>
        </div>
        <button
          type="button"
          className="quest-buttons-ui-test__back"
          data-type="ui-test-back-to-menu"
          onClick={() => appStore.backToMenu()}
        >
          В меню
        </button>
      </header>

      <section className="quest-buttons-ui-test__intro" aria-label="Принцип">
        <h2 className="quest-buttons-ui-test__intro-title">Без рамок</h2>
        <p className="quest-buttons-ui-test__intro-text">
          Контур кнопки формируется через <strong>градиент</strong>, <strong>свечение</strong> или{" "}
          <strong>тень</strong> — не через <code>border</code>. «Продолжить», «В меню» и «Смотреть
          видео» по-прежнему в одном nav-стиле.
        </p>
        <dl className="quest-buttons-ui-test__dna-grid">
          <div>
            <dt>Mission</dt>
            <dd>Арестовать · Блокировать · Штраф</dd>
          </div>
          <div>
            <dt>Nav</dt>
            <dd>Продолжить · В меню · Видео — один стиль</dd>
          </div>
          <div>
            <dt>Контур</dt>
            <dd>box-shadow / glow / 3D-тень — не border</dd>
          </div>
          <div>
            <dt>Форма</dt>
            <dd>капсула · soft-square · blob — без обводки</dd>
          </div>
        </dl>
      </section>

      <ProductionPanel />

      <div className="quest-buttons-ui-test__concepts">
        {BORDERLESS_VARIANTS.map((variant) => (
          <VariantPanel key={variant.id} variant={variant} />
        ))}
      </div>
    </div>
  );
}

function ProductionPanel() {
  return (
    <article
      className="quest-buttons-ui-test__concept quest-buttons-ui-test__concept--production"
      data-type="ui-variant-production"
      data-variant="production"
    >
      <header className="quest-buttons-ui-test__concept-header">
        <h2 className="quest-buttons-ui-test__concept-name">Production — Siren Bloom</h2>
        <p className="quest-buttons-ui-test__concept-tagline">
          Текущий стиль в игре · QuestCtaButton + ui-quest-cta.css
        </p>
      </header>

      <div className="quest-buttons-ui-test__contexts">
        <ProductionContext context="road" title="Контекст: дорога" />
        <ProductionContext context="dark" title="Контекст: модалка / ночь" />
      </div>
    </article>
  );
}

function ProductionContext({ context, title }) {
  return (
    <section
      className={`quest-buttons-ui-test__panel quest-buttons-ui-test__panel--${context}`}
      aria-label={title}
    >
      <h3 className="quest-buttons-ui-test__panel-title">{title}</h3>

      <div className="quest-buttons-ui-test__role-section">
        <h4 className="quest-buttons-ui-test__role-heading">
          Mission
          <span className="quest-buttons-ui-test__role-hint">квестовые действия</span>
        </h4>
        <div className="quest-buttons-ui-test__grid">
          {MISSION_BUTTONS.map((btn) => (
            <ProductionButtonSample key={`prod-${context}-mission-${btn.id}`} role="mission" btn={btn} />
          ))}
        </div>
      </div>

      <div className="quest-buttons-ui-test__role-section">
        <h4 className="quest-buttons-ui-test__role-heading">
          Nav
          <span className="quest-buttons-ui-test__role-hint">единый стиль</span>
        </h4>
        <div className="quest-buttons-ui-test__grid">
          {NAV_BUTTONS.map((btn) => (
            <ProductionButtonSample key={`prod-${context}-nav-${btn.id}`} role="nav" btn={btn} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductionButtonSample({ role, btn }) {
  const layoutClass =
    btn.id === "arrest"
      ? "quest-cta--police-modal quest-buttons-ui-test__cta-reset"
      : btn.id === "block"
        ? "quest-cta--map quest-buttons-ui-test__cta-reset"
        : btn.id === "watch-video"
          ? "quest-cta--refuel"
          : btn.id === "continue"
            ? "quest-cta--finish"
            : "";

  return (
    <div className="quest-buttons-ui-test__item" data-type={`ui-test-production-${btn.id}`}>
      <div className="quest-buttons-ui-test__meta">
        <span className="quest-buttons-ui-test__item-label">{btn.text}</span>
        <span className="quest-buttons-ui-test__item-context">{btn.context}</span>
        <code className="quest-buttons-ui-test__class-name">
          QuestCtaButton role=&quot;{role}&quot;
        </code>
      </div>
      <div className="quest-buttons-ui-test__preview">
        <QuestCtaButton role={role} className={layoutClass}>
          {btn.text}
        </QuestCtaButton>
      </div>
    </div>
  );
}

function VariantPanel({ variant }) {
  return (
    <article
      className="quest-buttons-ui-test__concept"
      data-type={`ui-variant-${variant.id}`}
      data-variant={variant.id}
    >
      <header className="quest-buttons-ui-test__concept-header">
        <h2 className="quest-buttons-ui-test__concept-name">{variant.name}</h2>
        <p className="quest-buttons-ui-test__concept-tagline">{variant.tagline}</p>
        <p className="quest-buttons-ui-test__concept-desc">{variant.description}</p>
        <p className="quest-buttons-ui-test__concept-diff">
          <strong>Отличие:</strong> {variant.diff}
        </p>
      </header>

      <div className="quest-buttons-ui-test__contexts">
        <ContextPanel variantId={variant.id} context="road" title="Контекст: дорога" />
        <ContextPanel variantId={variant.id} context="dark" title="Контекст: модалка / ночь" />
      </div>
    </article>
  );
}

function ContextPanel({ variantId, context, title }) {
  return (
    <section
      className={`quest-buttons-ui-test__panel quest-buttons-ui-test__panel--${context}`}
      aria-label={title}
    >
      <h3 className="quest-buttons-ui-test__panel-title">{title}</h3>

      <div className="quest-buttons-ui-test__role-section">
        <h4 className="quest-buttons-ui-test__role-heading">
          Mission
          <span className="quest-buttons-ui-test__role-hint">квестовые действия</span>
        </h4>
        <div className="quest-buttons-ui-test__grid">
          {MISSION_BUTTONS.map((btn) => (
            <ButtonSample
              key={`${variantId}-${context}-mission-${btn.id}`}
              variantId={variantId}
              role="mission"
              btn={btn}
            />
          ))}
        </div>
      </div>

      <div className="quest-buttons-ui-test__role-section">
        <h4 className="quest-buttons-ui-test__role-heading">
          Nav
          <span className="quest-buttons-ui-test__role-hint">единый стиль</span>
        </h4>
        <div className="quest-buttons-ui-test__grid">
          {NAV_BUTTONS.map((btn) => (
            <ButtonSample
              key={`${variantId}-${context}-nav-${btn.id}`}
              variantId={variantId}
              role="nav"
              btn={btn}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ButtonSample({ variantId, role, btn }) {
  return (
    <div
      className="quest-buttons-ui-test__item"
      data-type={`ui-test-${variantId}-${btn.id}`}
    >
      <div className="quest-buttons-ui-test__meta">
        <span className="quest-buttons-ui-test__item-label">{btn.text}</span>
        <span className="quest-buttons-ui-test__item-context">{btn.context}</span>
        <code className="quest-buttons-ui-test__class-name">
          .ui-btn--{variantId}.ui-btn--{role}
        </code>
      </div>
      <div className="quest-buttons-ui-test__preview">
        <button
          type="button"
          className={`ui-btn ui-btn--${variantId} ui-btn--${role}`}
        >
          {btn.text}
        </button>
      </div>
    </div>
  );
}
