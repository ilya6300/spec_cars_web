import { afterEach, beforeEach, expect, test, vi } from "vitest";
import ratioStore from "./ratioStore";
import { DISPATCH_RESPONSE_DELAY_SEC } from "./ratioConstants";

beforeEach(() => {
  vi.useFakeTimers();
  ratioStore.dispose();
});

afterEach(() => {
  ratioStore.dispose();
  vi.useRealTimers();
});

test("ratioStore: showMessage sets showing state", () => {
  ratioStore.showMessage("Диспетчер, есть что рядом?");

  expect(ratioStore.phase).toBe("showing");
  expect(ratioStore.message).toBe("Диспетчер, есть что рядом?");
  expect(ratioStore.sessionId).toBe(1);
  expect(ratioStore.playSoundOnShow).toBe(true);
  expect(ratioStore.isFlowActive).toBe(true);
});

test("ratioStore: onRatioDismiss clears message", () => {
  ratioStore.showMessage("Диспетчер, нужен эвакуатор.");
  ratioStore.onRatioDismiss();

  expect(ratioStore.message).toBeNull();
  expect(ratioStore.phase).toBe("idle");
  expect(ratioStore.isFlowActive).toBe(false);
});

test("ratioStore: onRatioDismiss invokes onComplete", () => {
  const onComplete = vi.fn();
  ratioStore.showMessage("Диспетчер, я свободный, есть что по близости?", {
    onComplete,
  });

  ratioStore.onRatioDismiss();
  expect(onComplete).not.toHaveBeenCalled();
  expect(ratioStore.phase).toBe("dispatch_wait");

  vi.advanceTimersByTime(DISPATCH_RESPONSE_DELAY_SEC * 1000);
  expect(onComplete).toHaveBeenCalledTimes(1);
});

test("ratioStore: timer chain show → dismiss → wait → second show", () => {
  ratioStore.showMessage("Диспетчер, готов принять вызов", {
    onComplete: () => {
      ratioStore.showDispatchResult("Да, рядом замечен конфликт");
    },
  });

  ratioStore.onRatioDismiss();
  expect(ratioStore.message).toBeNull();
  expect(ratioStore.phase).toBe("dispatch_wait");

  vi.advanceTimersByTime(DISPATCH_RESPONSE_DELAY_SEC * 1000);

  expect(ratioStore.phase).toBe("dispatch_result");
  expect(ratioStore.message).toBe("Да, рядом замечен конфликт");
});

test("ratioStore: sessionId invalidation", () => {
  const staleCallback = vi.fn();
  ratioStore.showMessage("first", {
    onComplete: staleCallback,
  });

  ratioStore.onRatioDismiss();
  ratioStore.showMessage("second");

  vi.advanceTimersByTime(DISPATCH_RESPONSE_DELAY_SEC * 1000);

  expect(staleCallback).not.toHaveBeenCalled();
  expect(ratioStore.message).toBe("second");
  expect(ratioStore.sessionId).toBe(2);
});

test("ratioStore: dispose clears timers and state", () => {
  const onComplete = vi.fn();
  ratioStore.showMessage("Диспетчер, есть что интересного?", {
    onComplete,
  });

  ratioStore.onRatioDismiss();
  ratioStore.dispose();

  expect(ratioStore.phase).toBe("idle");
  expect(ratioStore.message).toBeNull();
  expect(ratioStore.isFlowActive).toBe(false);

  vi.advanceTimersByTime(DISPATCH_RESPONSE_DELAY_SEC * 1000);
  expect(onComplete).not.toHaveBeenCalled();
});

test("ratioStore: isFlowActive", () => {
  expect(ratioStore.isFlowActive).toBe(false);

  ratioStore.showMessage("Диспетчер, диспетчер, есть что работа?", {
    onComplete: () => {},
  });
  expect(ratioStore.isFlowActive).toBe(true);

  ratioStore.onRatioDismiss();
  expect(ratioStore.isFlowActive).toBe(true);
  expect(ratioStore.phase).toBe("dispatch_wait");

  vi.advanceTimersByTime(DISPATCH_RESPONSE_DELAY_SEC * 1000);
  expect(ratioStore.isFlowActive).toBe(false);
});

test("ratioStore: responseDelaySec 0 invokes onComplete immediately", () => {
  const onComplete = vi.fn();
  ratioStore.showMessage("Диспетчер, нужен эвакуатор.", {
    onComplete,
    responseDelaySec: 0,
  });

  ratioStore.onRatioDismiss();
  expect(onComplete).toHaveBeenCalledTimes(1);
  expect(ratioStore.phase).toBe("idle");
});

test("ratioStore: orientation already message path", () => {
  ratioStore.showMessage(
    "Мы уже выслали ориентировку, следую к цели",
  );

  expect(ratioStore.message).toBe(
    "Мы уже выслали ориентировку, следую к цели",
  );
  expect(ratioStore.playSoundOnShow).toBe(true);
  expect(ratioStore.phase).toBe("showing");

  ratioStore.onRatioDismiss();
  expect(ratioStore.phase).toBe("idle");
  expect(ratioStore.message).toBeNull();
});
