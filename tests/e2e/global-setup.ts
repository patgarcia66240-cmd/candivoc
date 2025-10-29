// 🌐 Configuration globale pour les tests E2E
import { chromium } from '@playwright/test';

async function globalSetup() {
  console.log('🚀 Démarrage de la configuration globale des tests E2E');

  // 🌐 Vérifier que le serveur de développement est prêt
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // ⏳ Attendre que l'application soit disponible
    await page.goto('http://localhost:5173', { timeout: 30000 });
    await page.waitForSelector('body', { timeout: 10000 });
    console.log('✅ Application prête pour les tests');
  } catch (error) {
    console.error('❌ Erreur lors de la vérification de l\'application:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }

  console.log('🎯 Configuration globale terminée');
}

export default globalSetup;