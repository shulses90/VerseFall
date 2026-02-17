import { expect, test, describe, mock, beforeEach, afterEach } from "bun:test";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import Encyclopedia from "./Encyclopedia";
import { LORE_DATA } from "../lore";

describe("Encyclopedia Localization", () => {
  const mockOnClose = mock(() => {});
  const unlockedIds = new Set(['celestes']); // One unlocked entry

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  test("renders in English correctly", () => {
    render(
      <Encyclopedia
        unlockedIds={unlockedIds}
        onClose={mockOnClose}
        language="en"
      />
    );

    // Header
    expect(screen.getByText("Multiverse Codex")).toBeTruthy();

    // Placeholder message
    expect(screen.getByText("Select an unlocked entry from the list to view details.")).toBeTruthy();

    // Category
    expect(screen.getByText("Cosmic Entities")).toBeTruthy();

    // Unlocked entry title
    expect(screen.getByText("» The Célestes")).toBeTruthy();

    // Locked entry (e.g., demons)
    const classifiedEntries = screen.getAllByText("» [CLASSIFIED]");
    expect(classifiedEntries.length).toBeGreaterThan(0);
  });

  test("renders in French correctly", () => {
    render(
      <Encyclopedia
        unlockedIds={unlockedIds}
        onClose={mockOnClose}
        language="fr"
      />
    );

    // Header
    expect(screen.getByText("Codex Multiversel")).toBeTruthy();

    // Placeholder message
    expect(screen.getByText("Sélectionnez une entrée déverrouillée dans la liste pour voir les détails.")).toBeTruthy();

    // Category
    expect(screen.getByText("Entités Cosmiques")).toBeTruthy();

    // Unlocked entry title
    expect(screen.getByText("» Les Célestes")).toBeTruthy();

    // Locked entry
    const classifiedEntries = screen.getAllByText("» [CLASSIFIED]");
    expect(classifiedEntries.length).toBeGreaterThan(0);
  });

  test("displays entry content when selected", () => {
    render(
      <Encyclopedia
        unlockedIds={unlockedIds}
        onClose={mockOnClose}
        language="en"
      />
    );

    const entryButton = screen.getByText("» The Célestes");
    fireEvent.click(entryButton);

    // Should show title in main area
    expect(screen.getByRole("heading", { name: "The Célestes" })).toBeTruthy();

    // Content
    expect(screen.getByText(LORE_DATA['celestes'].content)).toBeTruthy();
  });

  test("displays French content when selected in French mode", () => {
    render(
      <Encyclopedia
        unlockedIds={unlockedIds}
        onClose={mockOnClose}
        language="fr"
      />
    );

    const entryButton = screen.getByText("» Les Célestes");
    fireEvent.click(entryButton);

    expect(screen.getByRole("heading", { name: "Les Célestes" })).toBeTruthy();
    expect(screen.getByText(LORE_DATA['celestes'].content_fr)).toBeTruthy();
  });

  test("calls onClose when close button is clicked", () => {
    render(
      <Encyclopedia
        unlockedIds={unlockedIds}
        onClose={mockOnClose}
        language="en"
      />
    );

    const closeButton = screen.getByLabelText("Close Codex");
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test("calls onClose when background is clicked", () => {
    render(
      <Encyclopedia
        unlockedIds={unlockedIds}
        onClose={mockOnClose}
        language="en"
      />
    );

    const dialog = screen.getByRole("dialog");
    fireEvent.click(dialog);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test("does not call onClose when modal content is clicked", () => {
    render(
      <Encyclopedia
        unlockedIds={unlockedIds}
        onClose={mockOnClose}
        language="en"
      />
    );

    const header = screen.getByText("Multiverse Codex");
    fireEvent.click(header);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test("sorting of categories and entries", () => {
    render(
      <Encyclopedia
        unlockedIds={unlockedIds}
        onClose={mockOnClose}
        language="en"
      />
    );

    const categories = screen.getAllByRole("heading", { level: 4 }).map(h => h.textContent);
    const sortedCategories = [...categories].sort((a, b) => a!.localeCompare(b!));
    expect(categories).toEqual(sortedCategories);
  });
});
