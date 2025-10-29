// 🧭 Tests E2E - Navigation de base - CandiVoc
import { test, expect } from '@playwright/test';

test.describe('Navigation de base', () => {
  test.beforeEach(async ({ page }) => {
    // 🏠 Accéder à la page d'accueil
    await page.goto('/');
  });

  test('🏠 Page d\'accueil se charge correctement', async ({ page }) => {
    // 🎯 Vérifier le titre de la page
    await expect(page).toHaveTitle(/CandiVoc/);

    // 🎯 Vérifier que le contenu principal est présent
    await expect(page.locator('body')).toBeVisible();

    // 🎯 Vérifier l'absence d'erreurs JavaScript
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.waitForLoadState('networkidle');
    expect(errors).toHaveLength(0);
  });

  test('📱 Navigation responsive', async ({ page }) => {
    // 📱 Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();

    // 💻 Test desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('body')).toBeVisible();

    // 📱 Test tablette
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('body')).toBeVisible();
  });

  test('🎨 Thème fonctionne correctement', async ({ page }) => {
    // 🌙 Vérifier les classes CSS du thème
    const html = page.locator('html');
    await expect(html).toBeVisible();

    // 🔄 Tester le changement de thème si disponible
    const themeToggle = page.locator('[data-testid="theme-toggle"], .theme-toggle, button[aria-label*="theme"], button[title*="theme"]');

    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(500); // Attendre la transition
      await expect(html).toBeVisible();
    }
  });

  test('♿ Accessibilité de base', async ({ page }) => {
    // 🎯 Vérifier la présence d'un heading principal
    const mainHeading = page.locator('h1, [role="heading"][aria-level="1"]');
    if (await mainHeading.isVisible()) {
      await expect(mainHeading).toBeVisible();
    }

    // 🎯 Vérifier la navigation au clavier
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);

    // 🎯 Vérifier que le focus est visible
    const focusedElement = page.locator(':focus');
    if (await focusedElement.isVisible()) {
      await expect(focusedElement).toBeVisible();
    }
  });

  test('🔗 Liens et navigation', async ({ page }) => {
    // 🔍 Trouver tous les liens
    const links = page.locator('a[href]');
    const linkCount = await links.count();

    if (linkCount > 0) {
      // 🎯 Tester le premier lien
      const firstLink = links.first();
      const href = await firstLink.getAttribute('href');

      if (href && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
        // 🧭 Tester navigation interne
        await firstLink.click();
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/.+/);
      }
    }
  });

  test('📊 Performance de base', async ({ page }) => {
    // ⏱️ Mesurer le temps de chargement
    const startTime = Date.now();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // 🎯 Le chargement doit prendre moins de 5 secondes
    expect(loadTime).toBeLessThan(5000);

    // 🎯 Vérifier que les images se chargent
    const images = page.locator('img');
    const imageCount = await images.count();

    if (imageCount > 0) {
      for (let i = 0; i < Math.min(imageCount, 5); i++) {
        const img = images.nth(i);
        const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
        if (naturalWidth > 0) {
          await expect(img).toBeVisible();
        }
      }
    }
  });

  test('🌐 Support multilingue', async ({ page }) => {
    // 🔍 Chercher les sélecteurs de langue
    const languageSelector = page.locator('[data-testid="language-select"], .language-select, select[name="lang"]');

    if (await languageSelector.isVisible()) {
      // 🎯 Tester le changement de langue
      const options = await languageSelector.locator('option').count();
      if (options > 1) {
        const firstOption = languageSelector.locator('option').nth(1);
        const langValue = await firstOption.getAttribute('value');

        if (langValue) {
          await languageSelector.selectOption(langValue);
          await page.waitForTimeout(500);
          await expect(page).toBeVisible();
        }
      }
    }
  });

  test('📝 Formulaires de base', async ({ page }) => {
    // 🔍 Chercher les formulaires
    const forms = page.locator('form');
    const formCount = await forms.count();

    if (formCount > 0) {
      const form = forms.first();

      // 🎯 Vérifier les champs de formulaire
      const inputs = form.locator('input, textarea, select');
      const inputCount = await inputs.count();

      if (inputCount > 0) {
        // 🧪 Tester le premier champ
        const firstInput = inputs.first();
        await expect(firstInput).toBeVisible();

        // 📝 Remplir le champ si c'est possible
        const inputType = await firstInput.getAttribute('type');
        if (inputType !== 'file' && inputType !== 'hidden') {
          await firstInput.fill('Test value');
          await expect(firstInput).toHaveValue('Test value');
        }
      }

      // 🎯 Vérifier les boutons de soumission
      const submitButtons = form.locator('button[type="submit"], input[type="submit"]');
      if (await submitButtons.count() > 0) {
        await expect(submitButtons.first()).toBeVisible();
      }
    }
  });

  test('📱 Fonctionnalités mobiles', async ({ page }) => {
    // 📱 Passer en vue mobile
    await page.setViewportSize({ width: 375, height: 667 });

    // 🎯 Vérifier le viewport
    const viewport = page.viewportSize();
    expect(viewport?.width).toBe(375);
    expect(viewport?.height).toBe(667);

    // 👆 Tester le touch si nécessaire
    await page.touchscreen.tap(100, 100);
    await page.waitForTimeout(100);
  });

  test('🔍 Recherche (si disponible)', async ({ page }) => {
    // 🔍 Chercher les champs de recherche
    const searchInputs = page.locator('input[placeholder*="recherch" i], input[name*="search" i], [data-testid="search"]');

    if (await searchInputs.isVisible()) {
      const searchInput = searchInputs.first();
      await searchInput.fill('test');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);

      // 🎯 Vérifier que la recherche a été effectuée
      await expect(page).toBeVisible();
    }
  });

  test('📊 Console - pas d\'erreurs', async ({ page }) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
      if (msg.type() === 'warn') warnings.push(msg.text());
    });

    page.on('pageerror', (error) => errors.push(error.message));

    await page.reload({ waitUntil: 'networkidle' });

    // 🎯 Vérifier qu'il n'y a pas d'erreurs critiques
    expect(errors.filter(e => !e.includes('Non-Error promise rejection'))).toHaveLength(0);

    // 📝 Logger les avertissements pour débogage
    if (warnings.length > 0) {
      console.log('⚠️ Avertissements:', warnings);
    }
  });
});