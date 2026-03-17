import { expect, test } from "@playwright/test";

test.describe("public shell background", () => {
  test("keeps the dark marketplace background on the root document for dark public routes", async ({ page }) => {
    await page.goto("/");

    const colors = await page.evaluate(() => ({
      body: window.getComputedStyle(document.body).backgroundColor,
      html: window.getComputedStyle(document.documentElement).backgroundColor
    }));

    expect(colors.body).toBe("rgb(16, 16, 16)");
    expect(colors.html).toBe("rgb(16, 16, 16)");
  });

  test("keeps the light marketplace background on the root document for light public routes", async ({ page }) => {
    await page.goto("/light");

    const colors = await page.evaluate(() => ({
      body: window.getComputedStyle(document.body).backgroundColor,
      html: window.getComputedStyle(document.documentElement).backgroundColor
    }));

    expect(colors.body).toBe("rgb(244, 246, 251)");
    expect(colors.html).toBe("rgb(244, 246, 251)");
  });
});
