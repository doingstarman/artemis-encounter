import { test, expect } from "@playwright/test";

test.describe("Mission selector → dashboard flow", () => {
  test("переход с главной на дашборд Artemis II", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Artemis II/i }).click();
    await expect(page).toHaveURL(/\/missions\/artemis-2/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Artemis II");
  });
});

test.describe("Timeline scrubber", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/missions/artemis-2");
  });

  test("нажатие на кнопку 'Лунный облет' меняет активную стадию", async ({ page }) => {
    await page.getByRole("button", { name: /Лунный облет/i }).click();
    // StagePanel shows the active stage title as h2
    await expect(page.getByRole("heading", { level: 2 }).first()).toContainText("Лунный облет");
  });

  test("нажатие на 'Запуск и выведение' переключает на первую стадию", async ({ page }) => {
    // Navigate to middle first
    await page.getByRole("button", { name: /Лунный облет/i }).click();
    await page.getByRole("button", { name: /Запуск и выведение/i }).click();
    await expect(page.getByRole("heading", { level: 2 }).first()).toContainText("Запуск и выведение");
  });
});

test.describe("MediaGallery", () => {
  test("отображает изображения или сообщение о недоступности", async ({ page }) => {
    await page.goto("/missions/artemis-2");
    // Either images load or the fallback message is shown
    const hasImages = await page.locator("img[loading=lazy]").count() > 0;
    if (hasImages) {
      await expect(page.locator("img[loading=lazy]").first()).toBeVisible();
    } else {
      await expect(page.getByText("Изображения временно недоступны")).toBeVisible();
    }
  });
});

test.describe("NewsFeed", () => {
  test("отображает новости или сообщение о недоступности", async ({ page }) => {
    await page.goto("/missions/artemis-2");
    const hasNews = await page.getByRole("link", { name: /Читать/i }).count() > 0;
    if (hasNews) {
      await expect(page.getByRole("link", { name: /Читать/i }).first()).toBeVisible();
    } else {
      await expect(page.getByText("Новости временно недоступны")).toBeVisible();
    }
  });
});

test.describe("Refresh button", () => {
  test("кнопка Refresh доступна и кликабельна", async ({ page }) => {
    await page.goto("/missions/artemis-2");
    const btn = page.getByRole("button", { name: /Refresh NASA Data/i });
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
  });
});
