import { expect, test } from "@playwright/test";

async function expectRootBackground(
  page: import("@playwright/test").Page,
  expectedColors: { body: string; html: string }
) {
  await page.waitForSelector(".marketplace-shell", { state: "attached" });
  await page.waitForFunction(
    (target) => {
      const bodyColor = window.getComputedStyle(document.body).backgroundColor;
      const htmlColor = window.getComputedStyle(document.documentElement).backgroundColor;

      return bodyColor === target.body && htmlColor === target.html;
    },
    expectedColors
  );
}

test.describe("public shell background", () => {
  test("keeps the dark marketplace background on the root document for dark public routes", async ({ page }) => {
    await page.goto("/");
    await expectRootBackground(page, {
      body: "rgb(16, 16, 16)",
      html: "rgb(16, 16, 16)"
    });
    await expect(page.locator(".marketplace-shell")).not.toHaveClass(/is-light-theme/);

    const colors = await page.evaluate(() => ({
      body: window.getComputedStyle(document.body).backgroundColor,
      html: window.getComputedStyle(document.documentElement).backgroundColor
    }));

    expect(colors.body).toBe("rgb(16, 16, 16)");
    expect(colors.html).toBe("rgb(16, 16, 16)");
  });

  test("keeps the light marketplace background on the root document for light public routes", async ({ page }) => {
    await page.goto("/light");
    await expectRootBackground(page, {
      body: "rgb(244, 246, 251)",
      html: "rgb(244, 246, 251)"
    });
    await expect(page.locator(".marketplace-shell")).toHaveClass(/is-light-theme/);

    const colors = await page.evaluate(() => ({
      body: window.getComputedStyle(document.body).backgroundColor,
      html: window.getComputedStyle(document.documentElement).backgroundColor
    }));

    expect(colors.body).toBe("rgb(244, 246, 251)");
    expect(colors.html).toBe("rgb(244, 246, 251)");
  });
});
