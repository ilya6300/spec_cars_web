# Реестр документации spec_cars_web

> Справочник проектных и внешних источников. Planner и Architect дополняют этот файл при появлении новых источников (через Orchestrator).

## Проектная документация

| Документ | Путь | Когда использовать |
|---|---|---|
| **Принципы работы проекта** | `.cursor/planner/PROJECT_PRINCIPLES.md` | Архитектура, MobX, game loop, квесты, слои — **читать перед любой задачей** |
| Точка входа | `src/main.jsx` | Bootstrap, подключение CSS |
| Корневой компонент | `src/App.jsx` | Fullscreen viewport |
| Игровой цикл | `src/components/game/Game.jsx` | rAF, связка сторов, рендер слоёв |
| Физика машины | `src/state/carStore.jsx` | Скорость, топливо, КПП, аудио |
| Мир и квесты | `src/state/mapStore.jsx` | Спавн, offsetX, светофор, квесты |
| AI-трафик | `src/state/questCarStore.jsx` | Quest-машины |
| Объекты окружения | `src/state/objects.jsx` | Конфиги спавна |
| Данные машин | `src/state/cars.jsx` | Полиция + otherCars |
| Рендер карты | `src/components/map/Maps.jsx` | Дорога, объекты, разметка |
| Управление | `src/components/controllers/Controllers.jsx` | Зажигание, газ, КПП, сирена |
| Vite config | `vite.config.js` | base path, сборка |
| Playwright config | `playwright.config.js` | E2E, baseURL |
| Техдокументация (после задач) | `.cursor/planner/PROJECT_DOCS.md` | Записи по завершённым задачам |

## Правила и агенты Cursor

| Документ | Путь | Когда использовать |
|---|---|---|
| Workflow | `.cursor/rules/workflow.mdc` | Жизненный цикл задач, роли агентов |
| Безопасные изменения | `.cursor/rules/safe-changes.mdc` | Минимальный diff, запрет импровизации |
| Безопасные изменения | `.cursor/rules/safe-changes.mdc` | Минимальный diff |
| **Работа на основе данных** | `.cursor/rules/evidence-based-work.mdc` | **Анализ до кода, gate, баги** |
| Разработка | `.cursor/rules/game-development.mdc` | Стандарты кода Developer |
| Code Review | `.cursor/rules/game-review.mdc` | Reviewer |
| Логирование | `.cursor/rules/logging.mdc` | Отладка игры |
| Техдокументация | `.cursor/rules/technical-documentation.mdc` | Technical Documentation Writer |
| Источники документации | `.cursor/rules/documentation-sources.mdc` | @docs, @web, запрет выдумывания |
| Orchestrator | `.cursor/agents/orchestrator.md` | Координация задач |
| Planner | `.cursor/agents/planer.md` | Проработка плана, декомпозиция |
| Architect | `.cursor/agents/architect.md` | Архитектура, SPEC.md |
| Developer | `.cursor/agents/developer.md` | Production-код (анализ → gate → код) |
| Reviewer | `.cursor/agents/reviewer.md` | Code Review по фактам |
| Technical Documentation Writer | `.cursor/agents/technical-documentation-writer.md` | PROJECT_DOCS.md |

## Тестовая инфраструктура

| Тип | Путь | Назначение |
|---|---|---|
| Unit/integration | `src/**/*.test.{js,jsx}` | Vitest + Testing Library |
| E2E | `tests/e2e/*.spec.js` | Playwright |
| Legacy E2E | `cypress/e2e/*.cy.js` | Cypress (legacy) |
| Playwright hook | `window.__PLAYWRIGHT__`, `window.__TEST_STATE__` | Доступ к store в E2E |

---

## Внешняя документация (через @web)

| Тема | URL | Когда использовать |
|---|---|---|
| MobX React | https://mobx.js.org/react-integration.html | observer, реактивность |
| MobX actions | https://mobx.js.org/actions.html | runInAction, мутации |
| React 19 | https://react.dev/ | Хуки, StrictMode |
| Vite | https://vite.dev/ | Сборка, base path, assets |
| Web Audio API | https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API | Звуки зажигания, сирены |
| requestAnimationFrame | https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame | Game loop |
| Playwright | https://playwright.dev/docs/intro | E2E-тесты |
| Vitest | https://vitest.dev/ | Unit-тесты |

## Платформенные ограничения

- **Только браузер.** React SPA, без SSR и backend.
- **Деплой:** GitHub Pages, `base: "/spec_cars_web/"`.
- **Mobile:** touch-события, `100dvh`, viewport без масштабирования.
- **Audio:** Web Audio API, требует user gesture для первого запуска.

## Приоритеты (общие)

1. Critical — блокирует игру (краш, game loop сломан)
2. High — важный функционал или серьёзный баг
3. Medium — улучшения, не блокирующие игру
4. Low — косметика, техдолг без срочности
