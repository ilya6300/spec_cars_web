import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";

vi.mock("./GearBox", () => ({
  GearBox: () => <div data-type="gearbox-mock" />,
}));

import { Controllers } from "./Controllers";

function createCarStore(overrides = {}) {
  const store = {
    isIgnitionOn: false,
    isGasPressed: false,
    fuel: 10000,
    gear: "N",
    sirena: false,
    toggleIgnition: vi.fn(),
    shiftGear: vi.fn(),
    pressGas: vi.fn(() => {
      store.isGasPressed = true;
    }),
    releaseGas: vi.fn(() => {
      store.isGasPressed = false;
    }),
    toggleSirena: vi.fn(),
    ...overrides,
  };
  return store;
}

function fireKey(type, code, options = {}) {
  window.dispatchEvent(
    new KeyboardEvent(type, {
      code,
      bubbles: true,
      cancelable: true,
      ...options,
    }),
  );
}

describe("Controllers keyboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("toggles ignition on ControlLeft", () => {
    const activeCarStore = createCarStore();
    render(<Controllers activeCarStore={activeCarStore} />);

    fireKey("keydown", "ControlLeft");
    expect(activeCarStore.toggleIgnition).toHaveBeenCalledOnce();
  });

  it("shifts gear from digit keys and KeyN", () => {
    const activeCarStore = createCarStore();
    render(<Controllers activeCarStore={activeCarStore} />);

    fireKey("keydown", "Digit2");
    expect(activeCarStore.shiftGear).toHaveBeenCalledWith("2");

    fireKey("keydown", "KeyN");
    expect(activeCarStore.shiftGear).toHaveBeenCalledWith("N");

    fireKey("keydown", "Digit0");
    expect(activeCarStore.shiftGear).toHaveBeenCalledWith("N");
  });

  it("shifts up on Shift keys", () => {
    const activeCarStore = createCarStore({ gear: "2" });
    render(<Controllers activeCarStore={activeCarStore} />);

    fireKey("keydown", "ShiftLeft");
    expect(activeCarStore.shiftGear).toHaveBeenCalledWith("3");
  });

  it("does not shift up beyond gear 4", () => {
    const activeCarStore = createCarStore({ gear: "4" });
    render(<Controllers activeCarStore={activeCarStore} />);

    fireKey("keydown", "ShiftRight");
    expect(activeCarStore.shiftGear).toHaveBeenCalledWith("4");
  });

  it("presses and releases gas on Space", () => {
    const activeCarStore = createCarStore();
    render(<Controllers activeCarStore={activeCarStore} />);

    fireKey("keydown", "Space");
    expect(activeCarStore.pressGas).toHaveBeenCalledOnce();

    fireKey("keyup", "Space");
    expect(activeCarStore.releaseGas).toHaveBeenCalledOnce();
  });

  it("toggles siren on KeyC", () => {
    const activeCarStore = createCarStore();
    render(<Controllers activeCarStore={activeCarStore} />);

    fireKey("keydown", "KeyC");
    expect(activeCarStore.toggleSirena).toHaveBeenCalledOnce();
  });

  it("ignores repeat for toggle and gear keys", () => {
    const activeCarStore = createCarStore();
    render(<Controllers activeCarStore={activeCarStore} />);

    fireKey("keydown", "ControlLeft", { repeat: true });
    fireKey("keydown", "Digit1", { repeat: true });
    fireKey("keydown", "ShiftLeft", { repeat: true });

    expect(activeCarStore.toggleIgnition).not.toHaveBeenCalled();
    expect(activeCarStore.shiftGear).not.toHaveBeenCalled();
  });

  it("blocks keyboard actions when controlsBlocked", () => {
    const activeCarStore = createCarStore();
    render(<Controllers activeCarStore={activeCarStore} controlsBlocked />);

    fireKey("keydown", "ControlLeft");
    fireKey("keydown", "Digit1");
    fireKey("keydown", "Space");
    fireKey("keyup", "Space");

    expect(activeCarStore.toggleIgnition).not.toHaveBeenCalled();
    expect(activeCarStore.shiftGear).not.toHaveBeenCalled();
    expect(activeCarStore.pressGas).not.toHaveBeenCalled();
    expect(activeCarStore.releaseGas).not.toHaveBeenCalled();
  });

  it("calls onEmptyGasPress when Space with empty fuel and ignition on", () => {
    const activeCarStore = createCarStore({
      fuel: 0,
      isIgnitionOn: true,
    });
    const onEmptyGasPress = vi.fn();
    render(
      <Controllers
        activeCarStore={activeCarStore}
        onEmptyGasPress={onEmptyGasPress}
      />,
    );

    fireKey("keydown", "Space");
    expect(onEmptyGasPress).toHaveBeenCalledOnce();
    expect(activeCarStore.pressGas).not.toHaveBeenCalled();
  });

  it("releases gas on window blur", () => {
    const activeCarStore = createCarStore({ isGasPressed: true });
    render(<Controllers activeCarStore={activeCarStore} />);

    window.dispatchEvent(new Event("blur"));
    expect(activeCarStore.releaseGas).toHaveBeenCalledOnce();
  });

  it("keeps gas pressed on pointer move outside pedal until pointer up", () => {
    const activeCarStore = createCarStore();
    const { getByAltText } = render(
      <Controllers activeCarStore={activeCarStore} />,
    );
    const pedal = getByAltText("Педаль газа");

    pedal.setPointerCapture = vi.fn();
    pedal.hasPointerCapture = vi.fn(() => true);
    pedal.releasePointerCapture = vi.fn();

    pedal.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        cancelable: true,
        pointerId: 1,
        pointerType: "touch",
      }),
    );
    expect(activeCarStore.pressGas).toHaveBeenCalledOnce();

    window.dispatchEvent(
      new PointerEvent("pointermove", {
        bubbles: true,
        cancelable: true,
        pointerId: 1,
        pointerType: "touch",
        clientX: 0,
        clientY: 0,
      }),
    );
    expect(activeCarStore.releaseGas).not.toHaveBeenCalled();

    pedal.dispatchEvent(
      new PointerEvent("pointerup", {
        bubbles: true,
        cancelable: true,
        pointerId: 1,
        pointerType: "touch",
      }),
    );
    expect(activeCarStore.releaseGas).toHaveBeenCalledOnce();
  });
});
