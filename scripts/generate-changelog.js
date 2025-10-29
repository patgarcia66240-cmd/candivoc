#!/usr/bin/env node

// 📝 Script de génération de changelog automatique
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 🎨 Configuration
const CONFIG = {
  // Types de commits à inclure
  types: {
    feat: '🚀 Features',
    fix: '🐛 Bug Fixes',
    docs: '📝 Documentation',
    style: '💎 Styles',
    refactor: '♻️ Code Refactoring',
    perf: '⚡ Performance Improvements',
    test: '🧪 Tests',
    build: '🏗️ Build System',
    ci: '🔧 CI/CD',
    chore: '🔧 Maintenance',
    security: '🔒 Security'
  },

  // Types à ignorer
  ignoreTypes: ['merge', 'revert', 'chore'],

  // Format de sortie
  format: {
    header: (version, date) => `# 🚀 Release ${version} - ${date}`,
    sections: (type, commits) => {
      if (commits.length === 0) return '';
      return `\n## ${CONFIG.types[type] || type}\n\n${commits.join('\n')}\n`;
    }
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

// 📥 Récupérer les commits depuis Git
function getCommits(sinceTag = null) {
  try {
    const range = sinceTag ? `${sinceTag}..HEAD` : '';
    const gitCommand = `git log --pretty=format:"%H|%h|%s|%an|%ad" --date=short ${range}`;
    const output = execSync(gitCommand, { encoding: 'utf8', cwd: process.cwd() });

    if (!output.trim()) {
      return [];
    }

    return output
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [hash, shortHash, subject, author, date] = line.split('|');
        return {
          hash,
          shortHash,
          subject: subject.trim(),
          author,
          date
        };
      });
  } catch (error) {
    console.error(colorize('❌ Erreur lors de la récupération des commits:', 'red'), error.message);
    return [];
  }
}

// 🏷️ Récupérer le dernier tag
function getLastTag() {
  try {
    const output = execSync('git describe --tags --abbrev=0', { encoding: 'utf8' });
    return output.trim();
  } catch (error) {
    return null;
  }
}

// 🔍 Parser un commit conventionnel
function parseCommit(commit) {
  // Pattern: type(scope): description
  const conventionalCommitRegex = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|security)(\(.+\))?\s*:\s*(.+)$/;
  const match = commit.subject.match(conventionalCommitRegex);

  if (!match) {
    // Tenter de matcher des patterns simples
    if (/merge/i.test(commit.subject)) return null;
    if (/bump/i.test(commit.subject)) return null;
    if (/update/i.test(commit.subject) && /package/i.test(commit.subject)) return null;

    return {
      type: 'chore',
      scope: null,
      description: commit.subject,
      breaking: false
    };
  }

  const [, type, scope, description] = match;
  const breaking = description.includes('BREAKING CHANGE') || type.startsWith('!');

  return {
    type: type.startsWith('!') ? type.slice(1) : type,
    scope: scope ? scope.slice(1, -1) : null,
    description: description.replace(/BREAKING CHANGE[\s\S]*/g, '').trim(),
    breaking
  };
}

// 📝 Formatter un commit pour le changelog
function formatCommit(commit, parsed) {
  const { hash, shortHash, author, date } = commit;
  const { type, scope, description, breaking } = parsed;

  let formatted = `- ${description} (${shortHash})`;

  if (scope && scope !== 'global') {
    formatted = `- **${scope}**: ${description} (${shortHash})`;
  }

  if (breaking) {
    formatted = `**⚠️ BREAKING CHANGE**: ${formatted}`;
  }

  return formatted;
}

// 📊 Grouper les commits par type
function groupCommits(commits) {
  const groups = {};

  for (const commit of commits) {
    const parsed = parseCommit(commit);

    if (!parsed || CONFIG.ignoreTypes.includes(parsed.type)) {
      continue;
    }

    if (!groups[parsed.type]) {
      groups[parsed.type] = [];
    }

    groups[parsed.type].push({
      commit,
      parsed
    });
  }

  return groups;
}

// 📝 Générer le changelog
function generateChangelog(options = {}) {
  const {
    version = null,
    sinceTag = null,
    outputFile = 'CHANGELOG.md',
    append = true
  } = options;

  console.log(colorize('📝 Generating changelog...', 'blue'));

  // Récupérer les commits
  const commits = getCommits(sinceTag);

  if (commits.length === 0) {
    console.log(colorize('ℹ️  No commits found since last tag', 'yellow'));
    return;
  }

  console.log(colorize(`📊 Found ${commits.length} commits`, 'green'));

  // Grouper les commits
  const groupedCommits = groupCommits(commits);

  // Générer le contenu
  const date = new Date().toISOString().split('T')[0];
  const releaseVersion = version || `v${require('../package.json').version}`;

  let changelog = CONFIG.format.header(releaseVersion, date);

  // Ajouter les breaking changes en premier
  if (groupedCommits.feat || groupedCommits.fix) {
    const breakingCommits = [];

    for (const type of ['feat', 'fix']) {
      if (groupedCommits[type]) {
        for (const { commit, parsed } of groupedCommits[type]) {
          if (parsed.breaking) {
            breakingCommits.push(formatCommit(commit, parsed));
          }
        }
      }
    }

    if (breakingCommits.length > 0) {
      changelog += '\n## ⚠️ BREAKING CHANGES\n\n';
      changelog += breakingCommits.join('\n') + '\n';
    }
  }

  // Ajouter les sections dans l'ordre
  const typeOrder = [
    'feat', 'fix', 'perf', 'refactor', 'style', 'test', 'docs',
    'build', 'ci', 'security', 'chore'
  ];

  for (const type of typeOrder) {
    if (groupedCommits[type]) {
      const commits = groupedCommits[type].map(({ commit, parsed }) =>
        formatCommit(commit, parsed)
      );

      changelog += CONFIG.format.sections(type, commits);
    }
  }

  // Ajouter les statistiques
  changelog += '\n## 📊 Statistics\n\n';
  changelog += `- **Total commits**: ${commits.length}\n`;
  changelog += `- **Contributors**: ${[...new Set(commits.map(c => c.author))].length}\n`;

  if (sinceTag) {
    changelog += `- **Since tag**: ${sinceTag}\n`;
  }

  // Écrire dans le fichier
  if (append && fs.existsSync(outputFile)) {
    const existingContent = fs.readFileSync(outputFile, 'utf8');
    const newContent = changelog + '\n' + existingContent;
    fs.writeFileSync(outputFile, newContent);
  } else {
    fs.writeFileSync(outputFile, changelog);
  }

  console.log(colorize(`✅ Changelog generated: ${outputFile}`, 'green'));
  console.log(colorize(`📊 Version: ${releaseVersion}`, 'blue'));
  console.log(colorize(`📝 Commits: ${commits.length}`, 'blue'));

  return changelog;
}

// 🚀 Point d'entrée principal
function main() {
  const args = process.argv.slice(2);
  const options = {};

  // Parser les arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--version':
        options.version = args[++i];
        break;
      case '--since':
        options.sinceTag = args[++i];
        break;
      case '--output':
        options.outputFile = args[++i];
        break;
      case '--no-append':
        options.append = false;
        break;
      case '--help':
        console.log(colorize('📝 Changelog Generator', 'bold'));
        console.log('');
        console.log('Usage: node generate-changelog.js [options]');
        console.log('');
        console.log('Options:');
        console.log('  --version <version>    Version number (e.g., 1.2.3)');
        console.log('  --since <tag>          Generate since this tag');
        console.log('  --output <file>        Output file (default: CHANGELOG.md)');
        console.log('  --no-append            Overwrite file instead of appending');
        console.log('  --help                 Show this help');
        console.log('');
        console.log('Examples:');
        console.log('  node generate-changelog.js');
        console.log('  node generate-changelog.js --version 1.2.3');
        console.log('  node generate-changelog.js --since v1.1.0');
        return;
    }
  }

  // Générer le changelog
  try {
    const changelog = generateChangelog(options);

    // Exporter pour GitHub Actions
    if (process.env.GITHUB_ACTIONS) {
      const version = options.version || require('../package.json').version;
      console.log(`::set-output name=version::${version}`);
      console.log(`::set-output name=changelog-length::${changelog.length}`);
    }
  } catch (error) {
    console.error(colorize('❌ Error generating changelog:', 'red'), error.message);
    process.exit(1);
  }
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = { generateChangelog, getCommits, parseCommit };