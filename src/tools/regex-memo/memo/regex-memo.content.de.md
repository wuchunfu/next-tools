### Normale Zeichen

Ausdruck | Beschreibung
:--|:--
`.` oder `[^\n\r]` | jedes Zeichen *außer* Zeilenumbruch oder Wagenrücklauf
`[A-Za-z]` | Alphabet
`[a-z]` | Kleinbuchstaben
`[A-Z]` | Großbuchstaben
`\d` oder `[0-9]` | Ziffer
`\D` oder `[^0-9]` | Nicht-Ziffer
`_` | Unterstrich
`\w` oder `[A-Za-z0-9_]` | Alphabet, Ziffer oder Unterstrich
`\W` oder `[^A-Za-z0-9_]` | Umkehrung von `\w`
`\S` | Umkehrung von `\s`

### Leerzeichen

Ausdruck | Beschreibung
:--|:--
` ` | Leerzeichen
`\t` | Tabulator
`\n` | Zeilenumbruch
`\r` | Wagenrücklauf
`\s` | Leerzeichen, Tabulator, Zeilenumbruch oder Wagenrücklauf

### Zeichensatz

Ausdruck | Beschreibung
:--|:--
`[xyz]` | entweder `x`, `y` oder `z`
`[^xyz]` | weder `x`, `y` noch `z`
`[1-3]` | entweder `1`, `2` oder `3`
`[^1-3]` | weder `1`, `2` noch `3`

- Stellen Sie sich einen Zeichensatz als eine `ODER`-Operation auf den einzelnen Zeichen vor, die zwischen den eckigen Klammern eingeschlossen sind.
- Verwenden Sie `^` nach der öffnenden `[`, um den Zeichensatz zu "negieren".
- Innerhalb eines Zeichensatzes bedeutet `.` einen wörtlichen Punkt.

### Zeichen, die Escaping erfordern

#### Außerhalb eines Zeichensatzes

Ausdruck | Beschreibung
:--|:--
`\.` | Punkt
`\^` | Zirkumflex
`\$` | Dollarzeichen
`\|` | Pipe
`\\` | Backslash
`\/` | Schrägstrich
`\(` | öffnende Klammer
`\)` | schließende Klammer
`\[` | öffnende eckige Klammer
`\]` | schließende eckige Klammer
`\{` | öffnende geschweifte Klammer
`\}` | schließende geschweifte Klammer

#### Innerhalb eines Zeichensatzes

Ausdruck | Beschreibung
:--|:--
`\\` | Backslash
`\]` | schließende eckige Klammer

- Ein `^` muss nur escaped werden, wenn es unmittelbar nach der öffnenden `[` des Zeichensatzes auftritt.
- Ein `-` muss nur escaped werden, wenn es zwischen zwei Buchstaben oder zwei Ziffern auftritt.

### Quantifizierer

Ausdruck | Beschreibung
:--|:--
`{2}` | genau 2
`{2,}` | mindestens 2
`{2,7}` | mindestens 2, aber nicht mehr als 7
`*` | 0 oder mehr
`+` | 1 oder mehr
`?` | genau 0 oder 1

- Der Quantifizierer steht *nach* dem zu quantifizierenden Ausdruck.

### Grenzen

Ausdruck | Beschreibung
:--|:--
`^` | Anfang der Zeichenkette
`$` | Ende der Zeichenkette
`\b` | Wortgrenze

- Wie die Wortgrenzen-Übereinstimmung funktioniert:
    - Am Anfang der Zeichenkette, wenn das erste Zeichen `\w` ist.
    - Zwischen zwei benachbarten Zeichen innerhalb der Zeichenkette, wenn das erste Zeichen `\w` und das zweite Zeichen `\W` ist.
    - Am Ende der Zeichenkette, wenn das letzte Zeichen `\w` ist.

### Übereinstimmung

Ausdruck | Beschreibung
:--|:--
`foo\|bar` | entweder `foo` oder `bar` finden
`foo(?=bar)` | `foo` finden, wenn es vor `bar` steht
`foo(?!bar)` | `foo` finden, wenn es *nicht* vor `bar` steht
`(?<=bar)foo` | `foo` finden, wenn es nach `bar` steht
`(?<!bar)foo` | `foo` finden, wenn es *nicht* nach `bar` steht

### Gruppierung und Erfassung

Ausdruck | Beschreibung
:--|:--
`(foo)` | Erfassungsgruppe; `foo` finden und erfassen
`(?:foo)` | Nicht-Erfassungsgruppe; `foo` finden, aber *ohne* `foo` zu erfassen
`(foo)bar\1` | `\1` ist eine Rückreferenz zur 1. Erfassungsgruppe; `foobarfoo` finden

- Erfassungsgruppen sind nur in den folgenden Methoden relevant:
    - `string.match(regexp)`
    - `string.matchAll(regexp)`
    - `string.replace(regexp, callback)`
- `\N` ist eine Rückreferenz zur `N-ten` Erfassungsgruppe. Erfassungsgruppen werden ab 1 nummeriert.

## Referenzen und Tools

- [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)
- [RegExplained](https://leaverou.github.io/regexplained/)
