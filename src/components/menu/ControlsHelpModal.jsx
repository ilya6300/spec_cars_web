import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import appStore from "../../state/appStore";
import { QuestCtaButton } from "../ui/QuestCtaButton";

const titleId = "controls-help-title";

const KEYBOARD_ROWS = [
  { action: "Зажигание", key: "Left Ctrl" },
  { action: "Нейтраль", key: "N / 0" },
  { action: "Передача 1", key: "1" },
  { action: "Передача 2", key: "2" },
  { action: "Передача 3", key: "3" },
  { action: "Передача 4", key: "4" },
  { action: "Следующая передача", key: "Shift" },
  { action: "Газ (удерживать)", key: "Пробел" },
  { action: "Сирена", key: "C" },
];

export const ControlsHelpModal = observer(() => {
  useEffect(() => {
    if (appStore.isControlsHelpOpen) {
      document.querySelector('[data-type="controls-help-back"]')?.focus();
    }
  }, [appStore.isControlsHelpOpen]);

  if (!appStore.isControlsHelpOpen) {
    return null;
  }

  return (
    <div
      className="controls-help-overlay"
      data-type="controls-help-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className="controls-help-backdrop"
        data-type="controls-help-backdrop"
        aria-hidden="true"
        onClick={() => appStore.backFromControlsHelp()}
      />
      <div className="controls-help-card" data-type="controls-help-card">
        <h2 id={titleId} className="controls-help-card__title">
          Управление
        </h2>
        <div className="controls-help-body" data-type="controls-help-body">
          <section
            className="controls-help-section"
            data-type="controls-help-section-mouse"
            aria-labelledby="controls-help-mouse-title"
          >
            <h3 id="controls-help-mouse-title" className="controls-help-section__title">
              Мышь и сенсор
            </h3>
            <p>
              Всё управление можно делать <strong>мышью</strong> или{" "}
              <strong>пальцем</strong> на сенсорном экране — кнопки внизу экрана во время
              игры:
            </p>
            <ul>
              <li>
                <strong>Зажигание</strong> — ключ слева
              </li>
              <li>
                <strong>Коробка передач (МКПП)</strong> — кнопки N, 1, 2, 3, 4
              </li>
              <li>
                <strong>Газ</strong> — педаль (удерживай)
              </li>
              <li>
                <strong>Сирена</strong> — кнопка сирены справа
              </li>
            </ul>
            <p>На компьютере то же доступно с клавиатуры — см. ниже.</p>
          </section>

          <section
            className="controls-help-section"
            data-type="controls-help-section-ignition"
            aria-labelledby="controls-help-ignition-title"
          >
            <h3 id="controls-help-ignition-title" className="controls-help-section__title">
              Зажигание
            </h3>
            <p>
              <strong>Сначала включи зажигание</strong> — без него машина не разгоняется, даже
              если жмёшь газ.
            </p>
            <p>Зажигание включает мотор; при выключении газ отпускается.</p>
          </section>

          <section
            className="controls-help-section"
            data-type="controls-help-section-gearbox"
            aria-labelledby="controls-help-gearbox-title"
          >
            <h3 id="controls-help-gearbox-title" className="controls-help-section__title">
              Коробка передач
            </h3>
            <p>
              У машины <strong>механическая коробка (МКПП)</strong>: нейтраль <strong>N</strong>{" "}
              и передачи <strong>1–4</strong>.
            </p>
            <p>
              На <strong>нейтрали</strong> скорость не растёт. Выбери передачу перед разгоном.
            </p>
            <p>
              <strong>Мышь / сенсор:</strong> нажми <strong>N</strong>, <strong>1</strong>,{" "}
              <strong>2</strong>, <strong>3</strong> или <strong>4</strong> на блоке МКПП.
            </p>
            <p>
              <strong>Клавиатура:</strong> <strong>N</strong> или <strong>0</strong> — нейтраль;{" "}
              <strong>1–4</strong> — передача; <strong>Shift</strong> — переключить на следующую
              передачу (с N → 1, с 1 → 2 …). На <strong>4-й</strong> передаче{" "}
              <strong>Shift</strong> ничего не делает.
            </p>
          </section>

          <section
            className="controls-help-section"
            data-type="controls-help-section-siren"
            aria-labelledby="controls-help-siren-title"
          >
            <h3 id="controls-help-siren-title" className="controls-help-section__title">
              Сирена
            </h3>
            <p>
              <strong>Сирена</strong> нужна для <strong>квестов</strong> и{" "}
              <strong>экстренных ситуаций</strong>:
            </p>
            <ul>
              <li>
                <strong>Красный светофор:</strong> без сирены машина <strong>тормозит</strong> на
                красный и <strong>газ не работает</strong>. С включённой сиреной можно{" "}
                <strong>продолжать движение</strong> на красный.
              </li>
              <li>
                <strong>Квест «Пешеход на красный»:</strong> появляется, когда ты{" "}
                <strong>остановился на красный</strong> и <strong>сирена выключена</strong>. Если
                сирена горит — этот квест не начнётся.
              </li>
              <li>
                <strong>Квест «Нарушитель у дороги»:</strong> нажми на нарушителя на обочине —
                сирена включится, начнётся задержание.
              </li>
              <li>
                <strong>Блокирование нарушителя на дороге:</strong> включи сирену, подъеди к
                нарушающей машине и нажми <strong>«Блокировать»</strong>.
              </li>
            </ul>
            <p>
              <strong>Мышь / сенсор:</strong> кнопка сирены. <strong>Клавиатура:</strong>{" "}
              <strong>C</strong>.
            </p>
          </section>

          <section
            className="controls-help-section"
            data-type="controls-help-section-keyboard"
            aria-labelledby="controls-help-keyboard-title"
          >
            <h3 id="controls-help-keyboard-title" className="controls-help-section__title">
              Клавиатура (ПК)
            </h3>
            <p>На компьютере управление дублирует кнопки на экране:</p>
            <table className="controls-help-table">
              <thead>
                <tr>
                  <th scope="col">Действие</th>
                  <th scope="col">Клавиша</th>
                </tr>
              </thead>
              <tbody>
                {KEYBOARD_ROWS.map(({ action, key }) => (
                  <tr key={action}>
                    <td>{action}</td>
                    <td>
                      <span className="controls-help-key">{key}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p>
              Клавиши <strong>не работают</strong> в меню, в модальных окнах и когда управление
              заблокировано (квест, заправка, завершение режима).
            </p>
          </section>
        </div>
        <div className="controls-help-card__actions">
          <QuestCtaButton
            role="nav"
            className="controls-help__back"
            data-type="controls-help-back"
            onClick={() => appStore.backFromControlsHelp()}
          >
            Назад
          </QuestCtaButton>
          <QuestCtaButton
            role="nav"
            className="controls-help__close"
            data-type="controls-help-close"
            onClick={() => appStore.closeSettings()}
          >
            Закрыть
          </QuestCtaButton>
        </div>
      </div>
    </div>
  );
});
