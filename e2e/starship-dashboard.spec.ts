import { expect, test } from "@playwright/test";

test.describe("Starship mission dashboard", () => {
  test("renders the complete dashboard and supports map/stage controls", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    await page.goto("/missions/starship");

    await expect(page.getByRole("heading", { name: "Starship orbital flight" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Telemetry" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Mission timeline" })).toBeVisible();
    await expect(page.getByRole("img", { name: /Three dimensional Earth/i })).toBeVisible();
    await page.screenshot({ path: "test-results/starship-desktop-3d.png", fullPage: true });

    await page.getByRole("button", { name: "2D", exact: true }).click();
    await expect(page.getByRole("img", { name: /Two dimensional orbital/i })).toBeVisible();

    await page.getByRole("button", { name: /Orbit insertion/i }).first().click();
    await expect(page.getByRole("button", { name: /Orbit insertion/i }).first()).toHaveAttribute("aria-current", "step");

    await page.screenshot({ path: "test-results/starship-desktop.png", fullPage: true });
    expect(consoleErrors).toEqual([]);
  });

  test("fits the mobile viewport without page-level horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/missions/starship");

    const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(hasOverflow).toBe(false);
    await expect(page.getByRole("button", { name: "3D", exact: true })).toBeVisible();
    await page.screenshot({ path: "test-results/starship-mobile.png", fullPage: true });
  });
});
