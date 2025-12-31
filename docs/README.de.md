
<div align="center">

# Next-Tools

**Eine Sammlung praktischer Online-Tools für Entwickler und IT-Profis**

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![GitHub stars](https://img.shields.io/github/stars/willjayyyy/next-tools)](https://github.com/willjayyyy/next-tools/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/willjayyyy/next-tools)](https://github.com/willjayyyy/next-tools/issues)

**🗣️ Sprachen:** [English](../README.md) • [中文](README.zh.md) • [Français](README.fr.md) • Deutsch • [Español](README.es.md) • [Português](README.pt.md) • [Русский](README.ru.md) • [Українська](README.uk.md) • [Norsk](README.no.md) • [Tiếng Việt](README.vi.md)

[🌐 Online ausprobieren!](https://next-tools.dev) •
[📖 Über das Projekt](https://next-tools.dev/about) •
[🐛 Fehler melden](https://github.com/willjayyyy/next-tools/issues) •
[💡 Funktion anfragen](https://github.com/willjayyyy/next-tools/issues/new/choose)

</div>

---

> **Hinweis:** Dies ist ein Fork des ursprünglichen [it-tools](https://github.com/CorentinTh/it-tools) Projekts, das von [Will Jay](https://github.com/willjayyyy) refactorisiert und gepflegt wird. Dieses Projekt ist unter GNU GPLv3 lizenziert.

## ✨ Features

- 🔧 **120+ Entwickler-Tools** - Von Datenkonvertierung bis Netzwerkanalyse
- 🎨 **Moderne UI** - Saubere, intuitive Benutzeroberfläche mit Vue.js 3
- 🔒 **Datenschutz zuerst** - Alle Tools laufen lokal in Ihrem Browser
- 🌍 **10 Sprachen** - Vollständige Internationalisierungsunterstützung
- 📱 **Responsives Design** - Funktioniert perfekt auf allen Geräten
- ⚡ **Schnell und leichtgewichtig** - Mit Vite für optimale Leistung
- 🆓 **Kostenlos und Open Source** - GPL-3.0 lizenziert, für immer kostenlos

## 🚀 Schnellstart

### Online-Nutzung
Besuchen Sie [next-tools.dev](https://next-tools.dev), um alle Tools direkt in Ihrem Browser zu verwenden.

### Selbst-Hosting

#### Von Docker Hub:
```bash
docker run -d --name next-tools \
  --restart unless-stopped \
  -p 8080:80 \
  willjayyyy/next-tools:latest
```

#### Von GitHub Packages:
```bash
docker run -d --name next-tools \
  --restart unless-stopped \
  -p 8080:80 \
  ghcr.io/willjayyyy/next-tools:latest
```

#### Lokale Entwicklung:
```bash
# Repository klonen
git clone https://github.com/willjayyyy/next-tools.git
cd next-tools

# Abhängigkeiten installieren
pnpm install

# Entwicklungsserver starten
pnpm dev
```

## 🛠️ Tool-Kategorien

- **Konverter** - JSON, XML, YAML, CSV, Base64, URL-Kodierung
- **Generatoren** - UUID, Passwort, QR-Code, Hash, JWT
- **Formatierer** - SQL, XML, JSON, CSS, JavaScript
- **Validierer** - E-Mail, URL, JSON, XML, Cron-Ausdrücke
- **Kodierer/Dekodierer** - Base64, URL, HTML-Entitäten, Morsecode
- **Rechner** - Prozentsatz, Subnetz, chmod-Berechtigungen
- **Text-Tools** - Groß-/Kleinschreibung, Lorem Ipsum, Wortzähler
- **Netzwerk-Tools** - IP-Rechner, MAC-Suche, DNS-Tools
- **Entwicklung** - Regex-Tester, Farbauswahl, HTTP-Statuscodes

## 🤝 Mitwirken

Wir freuen uns über Beiträge! So können Sie helfen:

### Empfohlene IDE-Konfiguration

**Empfohlene IDE-Einrichtung:**
- [VSCode](https://code.visualstudio.com/) mit folgenden Erweiterungen:
  - [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
  - [TypeScript Vue Plugin](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)
  - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
  - [i18n Ally](https://marketplace.visualstudio.com/items?itemName=lokalise.i18n-ally)

**VSCode-Einstellungen:**
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

### Projekt-Setup
```bash
# Abhängigkeiten installieren
pnpm install

# Entwicklungsserver starten
pnpm dev

# Für Produktion bauen
pnpm build

# Tests ausführen
pnpm test

# Code prüfen
pnpm lint
```

### Ein neues Tool hinzufügen

Erstellen Sie ein neues Tool mit unserem Generator:
```bash
pnpm run script:create:tool my-tool-name
```

Dies generiert die Basisdateien in `src/tools/my-tool-name/`.

## 🌍 Internationalisierung

Next-Tools unterstützt 10 Sprachen:
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

Um Übersetzungen beizutragen, bearbeiten Sie die JSON-Dateien im `locales/` Verzeichnis.

## 📄 Lizenz

## 📊 Analytics-Integration

Next-Tools unterstützt optionale Analytics-Integration für Nutzungsverfolgung. Konfigurieren Sie diese Umgebungsvariablen, um Analytics zu aktivieren:

### Vercel Analytics
```bash
VITE_ENABLE_VERCEL_ANALYTICS=true
VITE_DEBUG_VERCEL_ANALYTICS=false  # Optionaler Debug-Modus
```

### Google Analytics 4
```bash
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

### Umami Analytics
```bash
VITE_UMAMI_WEBSITE_ID=your-website-id
VITE_UMAMI_SCRIPT_URL=https://analytics.umami.is/script.js  # Optionale benutzerdefinierte URL
```

Analytics laufen nur in Produktions-Builds und sind vollständig optional.

## 🍪 Datenschutz-Einwilligung

Next-Tools enthält ein integriertes Einwilligungsverwaltungssystem, das DSGVO, CCPA und andere Datenschutzvorschriften erfüllt.

### Funktionen
- **Automatische Regionserkennung** - Erkennt automatisch die Region des Benutzers und zeigt den Einwilligungsdialog für DSGVO/CCPA-Regionen an
- **Anpassbare Optionen** - Benutzer können alles akzeptieren, alles ablehnen oder ihre Präferenzen anpassen
- **Persistente Speicherung** - Benutzereinstellungen werden lokal gespeichert und sitzungsübergreifend respektiert
- **Strikter Modus** - Optionaler Modus, der die Einwilligung aller Benutzer unabhängig von der Region erfordert

### Konfiguration
```bash
# Einwilligungsverwaltung aktivieren
VITE_CONSENT_ENABLE=true

# Strikten Modus aktivieren - Einwilligung aller Benutzer unabhängig von der Region erforderlich
VITE_CONSENT_STRICT=false
```

## 📄 Lizenz

Dieses Projekt ist unter der [GNU General Public License v3.0](LICENSE) lizenziert.

## 🙏 Danksagungen

- Ursprüngliches [it-tools](https://github.com/CorentinTh/it-tools) Projekt von Corentin Thomasset
- [Vue.js](https://vuejs.org/) - Progressives JavaScript-Framework
- [shadcn-vue](https://www.shadcn-vue.com/) - Vue 3 Komponentenbibliothek
- [Vite](https://vitejs.dev/) - Schnelles Build-Tool
- Alle unsere großartigen [Mitwirkenden](https://github.com/willjayyyy/next-tools/graphs/contributors)!

---

<div align="center">
Mit ❤️ gemacht von <a href="https://github.com/willjayyyy">Will Jay</a>

</div>
