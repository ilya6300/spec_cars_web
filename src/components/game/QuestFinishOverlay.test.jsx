import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuestFinishOverlay } from "./QuestFinishOverlay";

describe("QuestFinishOverlay", () => {
  it.each([
    ["pedestrian", "quest-finish-badge-pedestrian"],
    ["criminal", "quest-finish-badge-criminal"],
    ["enemy", "quest-finish-badge-enemy"],
  ])("renders variant %s with correct image data-type", (variant, expectedDataType) => {
    render(<QuestFinishOverlay variant={variant} onDismiss={() => {}} />);
    const image = screen.getByRole("img");
    expect(image.getAttribute("data-type")).toBe(expectedDataType);
  });

  it("calls onDismiss once when continue is clicked", () => {
    const onDismiss = vi.fn();
    render(<QuestFinishOverlay variant="criminal" onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole("button", { name: "Продолжить" }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("does not call onDismiss when dimmer is clicked", () => {
    const onDismiss = vi.fn();
    const { container } = render(
      <QuestFinishOverlay variant="criminal" onDismiss={onDismiss} />,
    );
    const dimmer = container.querySelector('[data-type="quest-finish-dimmer"]');
    fireEvent.click(dimmer);
    expect(onDismiss).not.toHaveBeenCalled();
  });
});
