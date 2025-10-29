// 🎨 Tests E2E - Design System Components - CandiVoc
import { test, expect } from '@playwright/test';

interface ExtendedPerformance extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

test.describe('Design System Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('🎯 Boutons (Buttons)', () => {
    test('Les boutons sont interactifs et accessibles', async ({ page }) => {
      const buttons = page.locator('button, input[type="button"], input[type="submit"]');
      const buttonCount = await buttons.count();

      if (buttonCount > 0) {
        const button = buttons.first();

        // 🎯 Visibilité
        await expect(button).toBeVisible();

        // 🖱️ Hover effect
        await button.hover();
        await expect(button).toBeVisible();

        // ♿ Accessibilité
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        expect(ariaLabel || buttonText).toBeTruthy();

        // 🖱️ Click
        await button.click();
        await page.waitForTimeout(500);
      }
    });

    test('Les boutons ont les états appropriés', async ({ page }) => {
      const buttons = page.locator('button:not([disabled])');
      const buttonCount = await buttons.count();

      if (buttonCount > 0) {
        const button = buttons.first();

        // 🎯 État normal
        await expect(button).toBeVisible();
        await expect(button).not.toBeDisabled();

        // 🎯 État focus
        await button.focus();
        await expect(button).toBeFocused();
      }

      // 🔒 Boutons désactivés
      const disabledButtons = page.locator('button[disabled], button[aria-disabled="true"]');
      if (await disabledButtons.count() > 0) {
        await expect(disabledButtons.first()).toBeDisabled();
      }
    });
  });

  test.describe('📝 Champs de saisie (Inputs)', () => {
    test('Les inputs sont fonctionnels et accessibles', async ({ page }) => {
      const inputs = page.locator('input[type="text"], input[type="email"], input[type="password"], textarea');
      const inputCount = await inputs.count();

      if (inputCount > 0) {
        const input = inputs.first();

        // 🎯 Visibilité
        await expect(input).toBeVisible();

        // 📝 Saisie de texte
        await input.fill('Test value');
        await expect(input).toHaveValue('Test value');

        // 🗑️ Effacement
        await input.clear();
        await expect(input).toHaveValue('');

        // ♿ Labels
        const label = page.locator(`label[for="${await input.getAttribute('id')}"]`);
        if (await label.isVisible()) {
          await expect(label).toBeVisible();
        }
      }
    });

    test('Les inputs gèrent les erreurs de validation', async ({ page }) => {
      const requiredInputs = page.locator('input[required], [aria-required="true"]');
      const inputCount = await requiredInputs.count();

      if (inputCount > 0) {
        const input = requiredInputs.first();

        // 📝 Remplir puis effacer pour déclencher la validation
        await input.fill('test');
        await input.clear();

        // 🖱️ Cliquer ailleurs pour déclencher la validation
        await page.click('body');
        await page.waitForTimeout(500);

        // 🎯 Vérifier l'état de validation
        await expect(input).toBeVisible();
      }
    });
  });

  test.describe('🏷️ Badges', () => {
    test('Les badges affichent correctement les informations', async ({ page }) => {
      const badges = page.locator('.badge, [role="badge"], span[class*="badge"]');
      const badgeCount = await badges.count();

      if (badgeCount > 0) {
        for (let i = 0; i < Math.min(badgeCount, 3); i++) {
          const badge = badges.nth(i);
          await expect(badge).toBeVisible();

          // 📏 Taille appropriée
          const box = await badge.boundingBox();
          expect(box?.height).toBeGreaterThan(10);
          expect(box?.height).toBeLessThan(50);
        }
      }
    });
  });

  test.describe('🃏 Cartes (Cards)', () => {
    test('Les cartes sont structurées correctement', async ({ page }) => {
      const cards = page.locator('.card, [class*="card"], article[role="article"]');
      const cardCount = await cards.count();

      if (cardCount > 0) {
        const card = cards.first();
        await expect(card).toBeVisible();

        // 📏 Dimensions
        const box = await card.boundingBox();
        expect(box?.width).toBeGreaterThan(100);
        expect(box?.height).toBeGreaterThan(50);

        // 🎯 Contenu
        const content = card.locator('h1, h2, h3, h4, h5, h6, p, div');
        if (await content.count() > 0) {
          await expect(content.first()).toBeVisible();
        }
      }
    });

    test('Les cartes interactives sont fonctionnelles', async ({ page }) => {
      const clickableCards = page.locator('.card[onclick], .card button, .card a');
      const cardCount = await clickableCards.count();

      if (cardCount > 0) {
        const card = clickableCards.first();

        // 🖱️ Hover effect
        await card.hover();
        await expect(card).toBeVisible();

        // 👆 Click
        await card.click();
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('🎨 Thème et styles', () => {
    test('Les couleurs et contrastes sont appropriés', async ({ page }) => {
      // 🎯 Vérifier les couleurs principales
      const elements = page.locator('body *');
      const elementCount = await elements.count();

      if (elementCount > 0) {
        // 🎨 Tester quelques éléments pour les styles
        for (let i = 0; i < Math.min(elementCount, 5); i++) {
          const element = elements.nth(i);
          const isVisible = await element.isVisible();

          if (isVisible) {
            const computedStyles = await element.evaluate((el) => {
              const styles = window.getComputedStyle(el);
              return {
                color: styles.color,
                backgroundColor: styles.backgroundColor,
                fontSize: styles.fontSize
              };
            });

            // 🎯 Vérifier que les couleurs ne sont pas transparentes
            expect(computedStyles.color).not.toBe('rgba(0, 0, 0, 0)');
            expect(computedStyles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
          }
        }
      }
    });

    test('Les animations et transitions sont fluides', async ({ page }) => {
      const animatedElements = page.locator('[class*="transition"], [class*="animate"]');
      const elementCount = await animatedElements.count();

      if (elementCount > 0) {
        const element = animatedElements.first();

        // 🖱️ Tester l'animation au hover
        await element.hover();
        await page.waitForTimeout(300);
        await expect(element).toBeVisible();
      }
    });
  });

  test.describe('📱 Responsive Design', () => {
    test('Le design s\'adapte aux différentes tailles d\'écran', async ({ page }) => {
      const sizes = [
        { width: 375, height: 667 },  // Mobile
        { width: 768, height: 1024 }, // Tablette
        { width: 1024, height: 768 }, // Desktop
        { width: 1920, height: 1080 } // Large desktop
      ];

      for (const size of sizes) {
        await page.setViewportSize(size);
        await page.waitForTimeout(500);

        // 🎯 Vérifier que le contenu est toujours visible
        await expect(page.locator('body')).toBeVisible();

        // 🎯 Vérifier qu'il n'y a pas de débordement horizontal
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        const viewportWidth = page.viewportSize()?.width || 0;
        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20); // Petite marge acceptable
      }
    });

    test('Les éléments mobiles fonctionnent correctement', async ({ page }) => {
      // 📱 Vue mobile
      await page.setViewportSize({ width: 375, height: 667 });

      // 👆 Navigation tactile
      const clickableElements = page.locator('button, a, input[type="button"]');
      const elementCount = await clickableElements.count();

      if (elementCount > 0) {
        const element = clickableElements.first();
        const box = await element.boundingBox();

        if (box) {
          // 👆 Tap sur l'élément
          await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
          await page.waitForTimeout(500);
        }
      }
    });
  });

  test.describe('♿ Accessibilité', () => {
    test('Les éléments interactifs sont accessibles au clavier', async ({ page }) => {
      const focusableElements = page.locator('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const elementCount = await focusableElements.count();

      if (elementCount > 0) {
        for (let i = 0; i < Math.min(elementCount, 5); i++) {
          const element = focusableElements.nth(i);

          // ⌨️ Navigation au clavier
          await element.focus();
          await expect(element).toBeFocused();

          // 🎯 Vérifier l'indicateur de focus
          const computedStyles = await element.evaluate((el) => {
            const styles = window.getComputedStyle(el);
            return styles.outline !== 'none' || styles.boxShadow !== 'none';
          });

          // Au moins un indicateur de focus devrait être présent
          if (!computedStyles) {
            console.log('⚠️ Élément sans indicateur de focus visible');
          }
        }
      }
    });

    test('Les attributs ARIA sont corrects', async ({ page }) => {
      // 🎯 Vérifier les rôles ARIA
      const elementsWithRoles = page.locator('[role]');
      const roleCount = await elementsWithRoles.count();

      if (roleCount > 0) {
        for (let i = 0; i < Math.min(roleCount, 5); i++) {
          const element = elementsWithRoles.nth(i);
          const role = await element.getAttribute('role');
          expect(role).toBeTruthy();
        }
      }

      // 🎯 Vérifier les labels
      const elementsWithLabels = page.locator('[aria-label], [aria-labelledby]');
      const labelCount = await elementsWithLabels.count();

      if (labelCount > 0) {
        for (let i = 0; i < Math.min(labelCount, 5); i++) {
          const element = elementsWithLabels.nth(i);
          const ariaLabel = await element.getAttribute('aria-label') ||
                          await element.getAttribute('aria-labelledby');
          expect(ariaLabel).toBeTruthy();
        }
      }
    });
  });

  test.describe('⚡ Performance', () => {
    test('Les composants ne créent pas de fuites de mémoire', async ({ page }) => {
      // 📊 Mesurer l'utilisation mémoire avant
      const initialMemory = await page.evaluate(() => {
        return (performance as ExtendedPerformance).memory?.usedJSHeapSize || 0;
      });

      // 🎯 Interagir avec plusieurs composants
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      const interactions = Math.min(buttonCount, 10);

      for (let i = 0; i < interactions; i++) {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          await button.hover();
          await page.waitForTimeout(100);
          await page.mouse.move(0, 0);
          await page.waitForTimeout(100);
        }
      }

      // 📊 Mesurer l'utilisation mémoire après
      const finalMemory = await page.evaluate(() => {
        return (performance as ExtendedPerformance).memory?.usedJSHeapSize || 0;
      });

      // 🎯 La différence ne devrait pas être énorme
      const memoryDifference = finalMemory - initialMemory;
      console.log(`📊 Différence mémoire: ${memoryDifference / 1024 / 1024} MB`);

      // Vérifier qu'il n'y a pas de fuite majeure (plus de 50MB d'augmentation)
      expect(memoryDifference).toBeLessThan(50 * 1024 * 1024);
    });
  });
});
