#!/usr/bin/env node

// 📏 Script de vérification de la taille du bundle
const fs = require('fs');
const path = require('path');

// 🎯 Configuration des limites
const BUDGETS = {
  // Taille totale du bundle
  total: {
    limit: 500 * 1024, // 500KB
    warning: 400 * 1024, // 400KB
  },
  // Taille des chunks individuels
  chunks: {
    limit: 100 * 1024, // 100KB par chunk
    warning: 80 * 1024, // 80KB warning
  },
  // Vendor chunks
  vendor: {
    limit: 200 * 1024, // 200KB
    warning: 150 * 1024, // 150KB
  },
  // Chunks spécifiques
  specific: {
    'react-vendor': { limit: 100 * 1024, warning: 80 * 1024 },
    'ui-libraries': { limit: 50 * 1024, warning: 40 * 1024 },
    'scenarios': { limit: 30 * 1024, warning: 25 * 1024 },
    'dashboard': { limit: 40 * 1024, warning: 35 * 1024 },
    'settings': { limit: 50 * 1024, warning: 40 * 1024 },
    'auth': { limit: 25 * 1024, warning: 20 * 1024 },
    'audio-services': { limit: 35 * 1024, warning: 30 * 1024 },
    'ai-services': { limit: 30 * 1024, warning: 25 * 1024 },
  }
};

// 🎨 Couleurs pour la console
const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
  reset: '\x1b[0m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

// 📊 Fonction pour formater la taille
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 📁 Fonction pour scanner les fichiers de build
function scanBuildFiles(buildDir = 'dist') {
  const files = [];

  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item.endsWith('.js')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const size = Buffer.byteLength(content, 'utf8');

        files.push({
          name: item,
          path: fullPath,
          size: size,
          relativePath: path.relative(buildDir, fullPath)
        });
      }
    }
  }

  scanDirectory(buildDir);
  return files;
}

// 🧩 Fonction pour analyser les chunks
function analyzeChunks(files) {
  const chunks = {
    vendor: [],
    specific: {},
    total: 0
  };

  for (const file of files) {
    chunks.total += file.size;

    // Détecter les vendor chunks
    if (file.name.includes('vendor') || file.name.includes('node_modules')) {
      chunks.vendor.push(file);
      continue;
    }

    // Détecter les chunks spécifiques
    for (const [chunkName, config] of Object.entries(BUDGETS.specific)) {
      if (file.name.includes(chunkName)) {
        chunks.specific[chunkName] = file;
        break;
      }
    }
  }

  return chunks;
}

// 🚨 Fonction pour vérifier les budgets
function checkBudgets(chunks) {
  let warnings = [];
  let errors = [];

  // Vérifier le budget total
  if (chunks.total > BUDGETS.total.limit) {
    errors.push(`Total bundle size ${formatBytes(chunks.total)} exceeds limit ${formatBytes(BUDGETS.total.limit)}`);
  } else if (chunks.total > BUDGETS.total.warning) {
    warnings.push(`Total bundle size ${formatBytes(chunks.total)} approaching limit ${formatBytes(BUDGETS.total.limit)}`);
  }

  // Vérifier les chunks spécifiques
  for (const [chunkName, config] of Object.entries(BUDGETS.specific)) {
    const chunk = chunks.specific[chunkName];
    if (chunk) {
      if (chunk.size > config.limit) {
        errors.push(`Chunk "${chunkName}" ${formatBytes(chunk.size)} exceeds limit ${formatBytes(config.limit)}`);
      } else if (chunk.size > config.warning) {
        warnings.push(`Chunk "${chunkName}" ${formatBytes(chunk.size)} approaching limit ${formatBytes(config.limit)}`);
      }
    }
  }

  // Vérifier les vendor chunks
  for (const vendorChunk of chunks.vendor) {
    if (vendorChunk.size > BUDGETS.vendor.limit) {
      errors.push(`Vendor chunk "${vendorChunk.name}" ${formatBytes(vendorChunk.size)} exceeds limit ${formatBytes(BUDGETS.vendor.limit)}`);
    } else if (vendorChunk.size > BUDGETS.vendor.warning) {
      warnings.push(`Vendor chunk "${vendorChunk.name}" ${formatBytes(vendorChunk.size)} approaching limit ${formatBytes(BUDGETS.vendor.limit)}`);
    }
  }

  return { warnings, errors };
}

// 📊 Fonction pour afficher le rapport
function displayReport(chunks, budgetCheck) {
  console.log(colorize('\n📊 Bundle Size Analysis Report', 'bold'));
  console.log('='.repeat(50));

  // Total
  console.log(`\n${colorize('📦 Total Bundle Size:', 'blue')} ${formatBytes(chunks.total)}`);
  if (chunks.total <= BUDGETS.total.warning) {
    console.log(colorize('   ✅ Within budget limits', 'green'));
  } else if (chunks.total <= BUDGETS.total.limit) {
    console.log(colorize('   ⚠️  Approaching limit', 'yellow'));
  } else {
    console.log(colorize('   ❌ Exceeds limit', 'red'));
  }

  // Chunks spécifiques
  console.log(colorize('\n🧩 Specific Chunks:', 'blue'));
  for (const [chunkName, config] of Object.entries(BUDGETS.specific)) {
    const chunk = chunks.specific[chunkName];
    if (chunk) {
      const status = chunk.size <= config.warning ? '✅' :
                    chunk.size <= config.limit ? '⚠️' : '❌';
      console.log(`   ${status} ${chunkName}: ${formatBytes(chunk.size)} (limit: ${formatBytes(config.limit)})`);
    } else {
      console.log(`   ℹ️  ${chunkName}: Not found`);
    }
  }

  // Vendor chunks
  console.log(colorize('\n📦 Vendor Chunks:', 'blue'));
  if (chunks.vendor.length > 0) {
    for (const vendorChunk of chunks.vendor) {
      const status = vendorChunk.size <= BUDGETS.vendor.warning ? '✅' :
                    vendorChunk.size <= BUDGETS.vendor.limit ? '⚠️' : '❌';
      console.log(`   ${status} ${vendorChunk.name}: ${formatBytes(vendorChunk.size)}`);
    }
  } else {
    console.log('   ℹ️  No vendor chunks found');
  }

  // Warnings et erreurs
  if (budgetCheck.warnings.length > 0) {
    console.log(colorize('\n⚠️  Warnings:', 'yellow'));
    budgetCheck.warnings.forEach(warning => console.log(`   ${warning}`));
  }

  if (budgetCheck.errors.length > 0) {
    console.log(colorize('\n❌ Errors:', 'red'));
    budgetCheck.errors.forEach(error => console.log(`   ${error}`));
  }

  // Résumé
  console.log(colorize('\n📋 Summary:', 'bold'));
  console.log(`   📁 Total files: ${Object.keys(chunks.specific).length + chunks.vendor.length}`);
  console.log(`   📏 Total size: ${formatBytes(chunks.total)}`);
  console.log(`   ⚠️  Warnings: ${budgetCheck.warnings.length}`);
  console.log(`   ❌ Errors: ${budgetCheck.errors.length}`);
}

// 🚀 Point d'entrée principal
function main() {
  try {
    console.log(colorize('🔍 Analyzing bundle size...', 'blue'));

    if (!fs.existsSync('dist')) {
      console.log(colorize('❌ Build directory not found. Run "npm run build" first.', 'red'));
      process.exit(1);
    }

    const files = scanBuildFiles();
    if (files.length === 0) {
      console.log(colorize('❌ No build files found.', 'red'));
      process.exit(1);
    }

    const chunks = analyzeChunks(files);
    const budgetCheck = checkBudgets(chunks);

    displayReport(chunks, budgetCheck);

    // Générer le rapport JSON pour les GitHub Actions
    if (process.env.GITHUB_ACTIONS) {
      const report = {
        total: chunks.total,
        warnings: budgetCheck.warnings.length,
        errors: budgetCheck.errors.length,
        withinBudget: budgetCheck.errors.length === 0
      };

      fs.writeFileSync('bundle-report.json', JSON.stringify(report, null, 2));

      // Exporter pour GitHub Actions
      console.log(`::set-output name=total-size::${chunks.total}`);
      console.log(`::set-output name=warnings::${budgetCheck.warnings.length}`);
      console.log(`::set-output name=errors::${budgetCheck.errors.length}`);
      console.log(`::set-output name=within-budget::${budgetCheck.errors.length === 0}`);
    }

    // Code de sortie
    if (budgetCheck.errors.length > 0) {
      console.log(colorize('\n❌ Bundle size check failed!', 'red'));
      process.exit(1);
    } else if (budgetCheck.warnings.length > 0) {
      console.log(colorize('\n⚠️  Bundle size check passed with warnings', 'yellow'));
      process.exit(0);
    } else {
      console.log(colorize('\n✅ Bundle size check passed!', 'green'));
      process.exit(0);
    }

  } catch (error) {
    console.error(colorize('❌ Error during analysis:', 'red'), error.message);
    process.exit(1);
  }
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = { main, BUDGETS };