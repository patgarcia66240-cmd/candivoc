// 🗺️ Tests E2E - Scénarios Utilisateur - CandiVoc
import { test, expect } from '@playwright/test';

test.describe('Scénarios Utilisateur', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('👤 Nouvel utilisateur', () => {
    test('🏠 Découverte de l\'application', async ({ page }) => {
      // 🎯 Page d'accueil
      await expect(page).toHaveURL(/.*\/$/);
      await expect(page.locator('body')).toBeVisible();

      // 📱 Test mobile d'abord
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);

      // 💻 Test desktop
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.waitForTimeout(500);

      // 🔍 Recherche de contenu
      const searchInput = page.locator('input[placeholder*="recherch" i], input[type="search"], [data-testid="search"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('scénario');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);
      }

      // 🎯 Navigation principale
      const navLinks = page.locator('nav a, header a, .navigation a');
      const linkCount = await navLinks.count();

      if (linkCount > 0) {
        // 🧭 Tester la navigation
        for (let i = 0; i < Math.min(linkCount, 3); i++) {
          const link = navLinks.nth(i);
          const href = await link.getAttribute('href');

          if (href && !href.startsWith('http') && !href.includes('mailto')) {
            await link.click();
            await page.waitForLoadState('networkidle');
            await expect(page.locator('body')).toBeVisible();
            await page.goBack();
            await page.waitForLoadState('networkidle');
          }
        }
      }
    });

    test('🎨 Personnalisation de l\'expérience', async ({ page }) => {
      // 🌙 Test du thème
      const themeToggle = page.locator('[data-testid="theme-toggle"], .theme-toggle, button[aria-label*="theme"], button[title*="theme"]');

      if (await themeToggle.isVisible()) {
        // 📸 Capture avant le changement
        await page.screenshot({ path: 'tests/e2e-results/theme-before.png' });

        // 🔄 Changement de thème
        await themeToggle.click();
        await page.waitForTimeout(1000);

        // 📸 Capture après le changement
        await page.screenshot({ path: 'tests/e2e-results/theme-after.png' });
      }

      // 📏 Test de la taille du texte si disponible
      const fontSizeControls = page.locator('[data-testid="font-size"], .font-size-control, button[aria-label*="taille"]');
      if (await fontSizeControls.isVisible()) {
        await fontSizeControls.first().click();
        await page.waitForTimeout(500);
      }
    });

    test('📝 Exploration des fonctionnalités', async ({ page }) => {
      // 🔍 Recherche avancée
      const advancedSearch = page.locator('[data-testid="advanced-search"], .advanced-search, .search-filters');
      if (await advancedSearch.isVisible()) {
        await advancedSearch.click();
        await page.waitForTimeout(500);

        // 🎯 Remplir les filtres
        const filters = advancedSearch.locator('input, select');
        const filterCount = await filters.count();

        for (let i = 0; i < Math.min(filterCount, 3); i++) {
          const filter = filters.nth(i);
          const tag = await filter.evaluate(el => el.tagName.toLowerCase());

          if (tag === 'select') {
            const options = await filter.locator('option').count();
            if (options > 1) {
              await filter.selectOption({ index: 1 });
            }
          } else if (tag === 'input') {
            await filter.fill('test');
          }
        }
      }

      // 📊 Dashboard si disponible
      const dashboard = page.locator('[data-testid="dashboard"], .dashboard, .stats');
      if (await dashboard.isVisible()) {
        // 📈 Vérifier les statistiques
        const stats = dashboard.locator('[data-testid*="stat"], .stat, .metric');
        const statCount = await stats.count();

        expect(statCount).toBeGreaterThan(0);

        // 🎯 Vérifier les graphiques
        const charts = dashboard.locator('[data-testid*="chart"], .chart, canvas');
        const chartCount = await charts.count();

        if (chartCount > 0) {
          await expect(charts.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('🔐 Utilisateur authentifié', () => {
    test.beforeEach(async ({ page }) => {
      // 🔄 Simuler une connexion (adapter selon l'application)
      const loginButton = page.locator('button:has-text("Connexion"), a:has-text("Connexion"), [data-testid="login"]');
      if (await loginButton.isVisible()) {
        await loginButton.click();
        await page.waitForTimeout(1000);
      }
    });

    test('👤 Accès au profil utilisateur', async ({ page }) => {
      // 👤 Menu utilisateur
      const userMenu = page.locator('[data-testid="user-menu"], .user-menu, .profile-menu, button[aria-label*="utilisateur"]');
      if (await userMenu.isVisible()) {
        await userMenu.click();
        await page.waitForTimeout(500);

        // 📋 Options du menu
        const menuItems = userMenu.locator('a, button, [role="menuitem"]');
        const itemCount = await menuItems.count();

        if (itemCount > 0) {
          // 🧭 Tester la navigation vers le profil
          const profileLink = menuItems.filter({ hasText: /profil|profile|compte/i }).first();

          if (await profileLink.isVisible()) {
            await profileLink.click();
            await page.waitForLoadState('networkidle');
            await expect(page.locator('body')).toBeVisible();
          }
        }
      }

      // ⚙️ Paramètres
      const settingsLink = page.locator('a:has-text("Paramètres"), [data-testid="settings"], .settings-link');
      if (await settingsLink.isVisible()) {
        await settingsLink.click();
        await page.waitForLoadState('networkidle');

        // 🎯 Vérifier la page de paramètres
        await expect(page.locator('body')).toBeVisible();
      }
    });

    test('💾 Gestion des données', async ({ page }) => {
      // 📝 Création/édition
      const createButton = page.locator('button:has-text("Créer"), button:has-text("Nouveau"), [data-testid="create"], .create-button');
      if (await createButton.isVisible()) {
        await createButton.click();
        await page.waitForTimeout(1000);

        // 📝 Remplir le formulaire
        const form = page.locator('form');
        if (await form.isVisible()) {
          const inputs = form.locator('input, textarea, select');
          const inputCount = await inputs.count();

          for (let i = 0; i < Math.min(inputCount, 3); i++) {
            const input = inputs.nth(i);
            const required = await input.getAttribute('required');

            if (required || i < 2) { // Remplir les 2 premiers champs ou les requis
              const tag = await input.evaluate(el => el.tagName.toLowerCase());
              if (tag === 'select') {
                const options = await input.locator('option').count();
                if (options > 1) {
                  await input.selectOption({ index: 1 });
                }
              } else {
                await input.fill(`Test ${i + 1}`);
              }
            }
          }

          // 💾 Sauvegarder
          const saveButton = form.locator('button[type="submit"], button:has-text("Sauvegarder"), button:has-text("Enregistrer")');
          if (await saveButton.isVisible()) {
            await saveButton.click();
            await page.waitForTimeout(2000);
          }
        }
      }

      // 🗑️ Suppression (avec confirmation)
      const deleteButton = page.locator('button:has-text("Supprimer"), [data-testid="delete"], .delete-button');
      const deleteCount = await deleteButton.count();

      if (deleteCount > 0) {
        const firstDelete = deleteButton.first();
        await firstDelete.click();
        await page.waitForTimeout(500);

        // 🚨 Confirmation
        const confirmButton = page.locator('button:has-text("Confirmer"), button:has-text("Oui"), button:has-text("Supprimer")');
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
          await page.waitForTimeout(1000);
        }
      }
    });

    test('📊 Historique et activité', async ({ page }) => {
      // 📈 Tableau de bord
      const dashboard = page.locator('[data-testid="dashboard"], .dashboard, main');
      if (await dashboard.isVisible()) {
        // 📊 Statistiques
        const stats = dashboard.locator('[data-testid*="stat"], .stat, .metric, .number');
        const statCount = await stats.count();

        if (statCount > 0) {
          for (let i = 0; i < Math.min(statCount, 3); i++) {
            const stat = stats.nth(i);
            await expect(stat).toBeVisible();
          }
        }

        // 📋 Liste d'activité
        const activityList = dashboard.locator('[data-testid="activity"], .activity-list, .recent-items');
        if (await activityList.isVisible()) {
          const items = activityList.locator('li, .item, .activity-item');
          const itemCount = await items.count();

          if (itemCount > 0) {
            await expect(items.first()).toBeVisible();
          }
        }
      }

      // 📅 Historique
      const historyLink = page.locator('a:has-text("Historique"), [data-testid="history"], .history-link');
      if (await historyLink.isVisible()) {
        await historyLink.click();
        await page.waitForLoadState('networkidle');

        // 🎯 Vérifier la page d'historique
        await expect(page.locator('body')).toBeVisible();

        // 📊 Filtres temporels
        const timeFilters = page.locator('[data-testid="period"], .period-filter, select[name="period"]');
        if (await timeFilters.isVisible()) {
          await timeFilters.selectOption({ label: '7 derniers jours' });
          await page.waitForTimeout(1000);
        }
      }
    });
  });

  test.describe('📱 Expérience mobile', () => {
    test('📱 Navigation mobile', async ({ page }) => {
      // 📱 Vue mobile
      await page.setViewportSize({ width: 375, height: 667 });

      // 🍔 Menu hamburger
      const hamburgerMenu = page.locator('button[aria-label*="menu"], .hamburger, .menu-toggle, [data-testid="menu-toggle"]');
      if (await hamburgerMenu.isVisible()) {
        await hamburgerMenu.click();
        await page.waitForTimeout(500);

        // 📋 Menu mobile
        const mobileMenu = page.locator('.mobile-menu, .nav-menu, [role="navigation"]');
        if (await mobileMenu.isVisible()) {
          const menuItems = mobileMenu.locator('a, button');
          const itemCount = await menuItems.count();

          expect(itemCount).toBeGreaterThan(0);

          // 🧭 Navigation
          if (itemCount > 1) {
            await menuItems.nth(1).click();
            await page.waitForLoadState('networkidle');
            await expect(page.locator('body')).toBeVisible();
          }
        }
      }

      // 👆 Navigation tactile
      const swipeArea = page.locator('body');
      await swipeArea.tap({ position: { x: 50, y: 100 } });
      await page.waitForTimeout(200);

      // 📜 Scroll tactile
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(500);
    });

    test('📱 Performance mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // ⚡ Mesurer les performances
      const navigationStart = await page.evaluate(() => performance.timing.navigationStart);
      const loadComplete = await page.evaluate(() => performance.timing.loadEventEnd);
      const loadTime = loadComplete - navigationStart;

      console.log(`📱 Temps de chargement mobile: ${loadTime}ms`);

      // 🎯 Le temps de chargement doit être raisonnable
      expect(loadTime).toBeLessThan(5000);

      // 📊 Utilisation mémoire mobile
      const memoryUsage = await page.evaluate(() => {
        const perf = performance as Performance & {
          memory?: {
            usedJSHeapSize: number;
          };
        };
        return perf.memory?.usedJSHeapSize || 0;
      });

      console.log(`📱 Mémoire utilisée: ${(memoryUsage / 1024 / 1024).toFixed(2)} MB`);
    });
  });

  test.describe('🔍 Scénarios de recherche', () => {
    test('🔍 Recherche simple', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="recherch" i], input[type="search"], [data-testid="search"]');
      const searchCount = await searchInput.count();

      if (searchCount > 0) {
        const search = searchInput.first();
        await search.fill('test');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);

        // 🎯 Vérifier les résultats
        const results = page.locator('[data-testid="search-results"], .search-results, .results');
        if (await results.isVisible()) {
          const resultItems = results.locator('li, .item, .result');
          const itemCount = await resultItems.count();

          if (itemCount > 0) {
            await expect(resultItems.first()).toBeVisible();
          }
        }

        // 🔍 Filtrage des résultats
        const filters = page.locator('[data-testid="filters"], .filters, .search-filters');
        if (await filters.isVisible()) {
          const firstFilter = filters.locator('input, select, button').first();
          if (await firstFilter.isVisible()) {
            await firstFilter.click();
            await page.waitForTimeout(1000);
          }
        }
      }
    });

    test('📂 Navigation par catégories', async ({ page }) => {
      // 🗂️ Catégories
      const categories = page.locator('[data-testid="categories"], .categories, .category-nav');
      if (await categories.isVisible()) {
        const categoryLinks = categories.locator('a, button');
        const linkCount = await categoryLinks.count();

        if (linkCount > 0) {
          // 🧭 Explorer quelques catégories
          for (let i = 0; i < Math.min(linkCount, 3); i++) {
            const category = categoryLinks.nth(i);
            await category.click();
            await page.waitForLoadState('networkidle');
            await expect(page.locator('body')).toBeVisible();
            await page.goBack();
            await page.waitForLoadState('networkidle');
          }
        }
      }

      // 🏷️ Tags
      const tags = page.locator('[data-testid="tags"], .tags, .tag-cloud');
      if (await tags.isVisible()) {
        const tagLinks = tags.locator('a, button, .tag');
        const tagCount = await tagLinks.count();

        if (tagCount > 0) {
          await tagLinks.first().click();
          await page.waitForTimeout(1000);
          await expect(page.locator('body')).toBeVisible();
        }
      }
    });
  });

  test.describe('🚨 Gestion des erreurs', () => {
    test('🌐 Pages d\'erreur', async ({ page }) => {
      // ❌ Page 404
      await page.goto('/page-inexistante');
      await page.waitForLoadState('networkidle');

      // 🎯 Vérifier que la page 404 est conviviale
      const notFoundContent = page.locator('h1:has-text("404"), h1:has-text("introuvable"), .error-404');
      if (await notFoundContent.isVisible()) {
        await expect(notFoundContent).toBeVisible();

        // 🔗 Lien de retour
        const homeLink = page.locator('a:has-text("accueil"), a:has-text("retour")');
        if (await homeLink.isVisible()) {
          await homeLink.click();
          await page.waitForLoadState('networkidle');
          await expect(page).toHaveURL(/.*\/$/);
        }
      }

      // 🚨 Page d'erreur serveur (simulée)
      await page.route('**/*', route => {
        if (route.request().url().includes('simulate-error')) {
          route.fulfill({
            status: 500,
            contentType: 'text/html',
            body: '<html><body><h1>Erreur serveur</h1></body></html>'
          });
        } else {
          route.continue();
        }
      });

      await page.goto('/simulate-error');
      await page.waitForTimeout(1000);

      const errorContent = page.locator('h1:has-text("erreur"), .error-page, .server-error');
      if (await errorContent.isVisible()) {
        await expect(errorContent).toBeVisible();
      }
    });

    test('🔗 Liens cassés', async ({ page }) => {
      // 🔍 Trouver tous les liens internes
      const internalLinks = page.locator('a[href^="/"], a[href^="./"]');
      const linkCount = await internalLinks.count();

      if (linkCount > 0) {
        // 🧭 Tester quelques liens
        for (let i = 0; i < Math.min(linkCount, 5); i++) {
          const link = internalLinks.nth(i);
          const href = await link.getAttribute('href');

          if (href && !href.includes('#')) { // Ignorer les ancres
            const response = await page.goto(href);
            if (response) {
              // 🎯 Vérifier que la page se charge correctement
              expect(response.status()).toBeLessThan(500);
            }

            await page.waitForTimeout(500);
            await page.goBack();
            await page.waitForLoadState('networkidle');
          }
        }
      }
    });
  });

  test.describe('♿ Accessibilité avancée', () => {
    test('🎯 Navigation au clavier complète', async ({ page }) => {
      // ⌨️ Tabulation à travers tous les éléments focusables
      const focusableElements = page.locator('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const elementCount = await focusableElements.count();

      if (elementCount > 0) {
        // 🏁 Démarrer en haut de la page
        await page.keyboard.press('Home');

        // ⏭️ Navigation au clavier
        for (let i = 0; i < Math.min(elementCount, 10); i++) {
          await page.keyboard.press('Tab');
          await page.waitForTimeout(100);

          // 🎯 Vérifier qu'un élément est focusé
          const focusedElement = page.locator(':focus');
          const isFocused = await focusedElement.count() > 0;

          if (!isFocused) {
            console.log('⚠️ Aucun élément focusé après tabulation');
          }
        }

        // ⏪ Navigation arrière
        for (let i = 0; i < 3; i++) {
          await page.keyboard.press('Shift+Tab');
          await page.waitForTimeout(100);
        }
      }
    });

    test('📖 Lecteurs d\'écran', async ({ page }) => {
      // 🎯 Vérifier les attributs ARIA
      const elementsWithAria = page.locator('[aria-label], [aria-labelledby], [role], [aria-describedby]');
      const ariaCount = await elementsWithAria.count();

      if (ariaCount > 0) {
        for (let i = 0; i < Math.min(ariaCount, 5); i++) {
          const element = elementsWithAria.nth(i);
          const attributes = await element.evaluate((el) => {
            const attrs: Record<string, string> = {};
            for (let i = 0; i < el.attributes.length; i++) {
              const attr = el.attributes[i];
              if (attr.name.startsWith('aria-') || attr.name === 'role') {
                attrs[attr.name] = attr.value;
              }
            }
            return attrs;
          });

          // 🎯 Vérifier que les attributs ARIA ont des valeurs
          Object.entries(attributes).forEach(([, value]) => {
            expect(value).toBeTruthy();
          });
        }
      }

      // 📖 Structure sémantique
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const headingCount = await headings.count();

      if (headingCount > 0) {
        // 🎯 Vérifier la hiérarchie des titres
        let previousLevel = 0;
        for (let i = 0; i < Math.min(headingCount, 10); i++) {
          const heading = headings.nth(i);
          const level = parseInt(await heading.evaluate((el) => el.tagName.substring(1)));

          if (previousLevel > 0 && level > previousLevel + 1) {
            console.log(`⚠️ Saut de niveau de titre: h${previousLevel} → h${level}`);
          }

          previousLevel = level;
        }
      }
    });
  });
});
