
<div align="center">

# Next-Tools

**Une collection d'outils pratiques en ligne pour les développeurs et professionnels de l'informatique**

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![GitHub stars](https://img.shields.io/github/stars/willjayyyy/next-tools)](https://github.com/willjayyyy/next-tools/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/willjayyyy/next-tools)](https://github.com/willjayyyy/next-tools/issues)

**🗣️ Langues:** [English](../README.md) • [中文](README.zh.md) • Français • [Deutsch](README.de.md) • [Español](README.es.md) • [Português](README.pt.md) • [Русский](README.ru.md) • [Українська](README.uk.md) • [Norsk](README.no.md) • [Tiếng Việt](README.vi.md)

[🌐 Essayez-le en ligne !](https://next-tools.dev) •
[📖 À propos](https://next-tools.dev/about) •
[🐛 Signaler un bug](https://github.com/willjayyyy/next-tools/issues) •
[💡 Demander une fonctionnalité](https://github.com/willjayyyy/next-tools/issues/new/choose)

</div>

---

> **Note :** Ceci est un fork du projet original [it-tools](https://github.com/CorentinTh/it-tools), refactorisé et maintenu par [Will Jay](https://github.com/willjayyyy). Ce projet est sous licence GNU GPLv3.

## ✨ Fonctionnalités

- 🔧 **120+ outils pour développeurs** - De la conversion de données à l'analyse réseau
- 🎨 **Interface moderne** - Interface propre et intuitive construite avec Vue.js 3
- 🔒 **Confidentialité d'abord** - Tous les outils s'exécutent localement dans votre navigateur
- 🌍 **10 langues** - Support complet de l'internationalisation
- 📱 **Design responsive** - Fonctionne parfaitement sur tous les appareils
- ⚡ **Rapide et léger** - Construit avec Vite pour des performances optimales
- 🆓 **Gratuit et open source** - Sous licence GPL-3.0, gratuit pour toujours

## 🚀 Démarrage rapide

### Utilisation en ligne
Visitez [next-tools.dev](https://next-tools.dev) pour utiliser tous les outils directement dans votre navigateur.

### Auto-hébergement

#### Depuis Docker Hub :
```bash
docker run -d --name next-tools \
  --restart unless-stopped \
  -p 8080:80 \
  willjayyyy/next-tools:latest
```

#### Depuis GitHub Packages :
```bash
docker run -d --name next-tools \
  --restart unless-stopped \
  -p 8080:80 \
  ghcr.io/willjayyyy/next-tools:latest
```

#### Développement local :
```bash
# Cloner le dépôt
git clone https://github.com/willjayyyy/next-tools.git
cd next-tools

# Installer les dépendances
pnpm install

# Démarrer le serveur de développement
pnpm dev
```

## 🛠️ Catégories d'outils

- **Convertisseurs** - JSON, XML, YAML, CSV, Base64, encodage URL
- **Générateurs** - UUID, mot de passe, QR code, hash, JWT
- **Formateurs** - SQL, XML, JSON, CSS, JavaScript
- **Validateurs** - Email, URL, JSON, XML, expressions cron
- **Encodeurs/Décodeurs** - Base64, URL, entités HTML, code Morse
- **Calculateurs** - Pourcentage, sous-réseau, permissions chmod
- **Outils texte** - Convertisseur de casse, lorem ipsum, compteur de mots
- **Outils réseau** - Calculateur IP, recherche MAC, outils DNS
- **Développement** - Testeur d'expressions régulières, sélecteur de couleurs, codes de statut HTTP

## 🤝 Contribution

Nous accueillons les contributions ! Voici comment vous pouvez aider :

### Configuration de l'IDE recommandée

**Configuration IDE recommandée :**
- [VSCode](https://code.visualstudio.com/) avec les extensions suivantes :
  - [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
  - [TypeScript Vue Plugin](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)
  - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
  - [i18n Ally](https://marketplace.visualstudio.com/items?itemName=lokalise.i18n-ally)

**Paramètres VSCode :**
```json
{
  "editor.formatOnSave": false,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "i18n-ally.localesPaths": ["locales", "src/tools/*/locales"],
  "i18n-ally.keystyle": "nested"
}
```

### Configuration du projet
```bash
# Installer les dépendances
pnpm install

# Démarrer le serveur de développement
pnpm dev

# Construire pour la production
pnpm build

# Exécuter les tests
pnpm test

# Vérifier le code
pnpm lint
```

### Ajouter un nouvel outil

Créer un nouvel outil avec notre générateur :
```bash
pnpm run script:create:tool my-tool-name
```

Ceci générera les fichiers de base dans `src/tools/my-tool-name/`.

## 🌍 Internationalisation

Next-Tools prend en charge 10 langues :
- 🇺🇸 English (en)
- 🇨🇳 中文 (zh)
- 🇫🇷 Français (fr)
- 🇩🇪 Deutsch (de)
- 🇪🇸 Español (es)
- 🇵🇹 Português (pt)
- 🇷🇺 Русский (ru)
- 🇺🇦 Українська (uk)
- 🇳🇴 Norsk (no)
- 🇻🇳 Tiếng Việt (vi)

Pour contribuer aux traductions, modifiez les fichiers JSON dans le répertoire `locales/`.

## 📄 Licence

## 📊 Intégration Analytics

Next-Tools prend en charge l'intégration d'analyse optionnelle pour le suivi d'utilisation. Configurez ces variables d'environnement pour activer les analytics :

### Vercel Analytics
```bash
VITE_ENABLE_VERCEL_ANALYTICS=true
VITE_DEBUG_VERCEL_ANALYTICS=false  # Mode debug optionnel
```

### Google Analytics 4
```bash
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

### Umami Analytics
```bash
VITE_UMAMI_WEBSITE_ID=your-website-id
VITE_UMAMI_SCRIPT_URL=https://analytics.umami.is/script.js  # URL personnalisée optionnelle
```

Les analytics ne s'exécutent que dans les builds de production et sont complètement optionnels.

## 🍪 Gestion du Consentement

Next-Tools inclut un système de gestion du consentement intégré conforme au RGPD, CCPA et autres réglementations sur la vie privée.

### Fonctionnalités
- **Détection automatique de la région** - Détecte automatiquement la région de l'utilisateur et affiche la boîte de dialogue de consentement pour les régions RGPD/CCPA
- **Options personnalisables** - Les utilisateurs peuvent tout accepter, tout refuser ou personnaliser leurs préférences
- **Stockage persistant** - Les préférences utilisateur sont enregistrées localement et respectées entre les sessions
- **Mode strict** - Mode optionnel pour exiger le consentement de tous les utilisateurs quelle que soit leur région

### Configuration
```bash
# Activer la gestion du consentement
VITE_CONSENT_ENABLE=true

# Activer le mode strict - exiger le consentement de tous les utilisateurs quelle que soit leur région
VITE_CONSENT_STRICT=false
```

Ce projet est sous licence [GNU General Public License v3.0](LICENSE).

## 🙏 Remerciements

- Projet original [it-tools](https://github.com/CorentinTh/it-tools) par Corentin Thomasset
- [Vue.js](https://vuejs.org/) - Framework JavaScript progressif
- [shadcn-vue](https://www.shadcn-vue.com/) - Bibliothèque de composants Vue 3
- [Vite](https://vitejs.dev/) - Outil de construction rapide
- Tous nos merveilleux [contributeurs](https://github.com/willjayyyy/next-tools/graphs/contributors) !

---

<div align="center">
Fait avec ❤️ par <a href="https://github.com/willjayyyy">Will Jay</a>

</div>
