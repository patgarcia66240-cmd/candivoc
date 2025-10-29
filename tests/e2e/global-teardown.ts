// 🧹 Nettoyage global après les tests E2E

async function globalTeardown() {
  console.log('🧹 Nettoyage global des tests E2E');

  // 🗑️ Nettoyage des fichiers temporaires si nécessaire
  // Logs de fin
  console.log('✅ Tests E2E terminés');
}

export default globalTeardown;