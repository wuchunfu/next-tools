### Normale tegn

Uttrykk | Beskrivelse
:--|:--
`.` eller `[^\n\r]` | hvilket som helst tegn *unntatt* linjeskift eller retur
`[A-Za-z]` | alfabet
`[a-z]` | små bokstaver
`[A-Z]` | store bokstaver
`\d` eller `[0-9]` | siffer
`\D` eller `[^0-9]` | ikke-siffer
`_` | understrek
`\w` eller `[A-Za-z0-9_]` | alfabet, siffer eller understrek
`\W` eller `[^A-Za-z0-9_]` | invers av `\w`
`\S` | invers av `\s`

### Mellomromstegn

Uttrykk | Beskrivelse
:--|:--
` ` | mellomrom
`\t` | tabulator
`\n` | linjeskift
`\r` | retur
`\s` | mellomrom, tabulator, linjeskift eller retur

### Tegnsett

Uttrykk | Beskrivelse
:--|:--
`[xyz]` | enten `x`, `y` eller `z`
`[^xyz]` | verken `x`, `y` eller `z`
`[1-3]` | enten `1`, `2` eller `3`
`[^1-3]` | verken `1`, `2` eller `3`

- Tenk på et tegnsett som en `ELLER`-operasjon på de enkelte tegnene som er innelukket mellom de firkantede parentesene.
- Bruk `^` etter den åpne `[` for å "negere" tegnsettet.
- Innenfor et tegnsett betyr `.` en bokstavelig periode.

### Tegn som krever escaping

#### Utenfor et tegnsett

Uttrykk | Beskrivelse
:--|:--
`\.` | punktum
`\^` | cirkumfleks
`\$` | dollartegn
`\|` | rør
`\\` | bakover skråstrek
`\/` | forover skråstrek
`\(` | åpningsparentes
`\)` | lukkeparentes
`\[` | åpningsfirkantparentes
`\]` | lukkefirkantparentes
`\{` | åpningskrøllparentes
`\}` | lukkekrøllparentes

#### Innenfor et tegnsett

Uttrykk | Beskrivelse
:--|:--
`\\` | bakover skråstrek
`\]` | lukkefirkantparentes

- En `^` må bare escapes hvis den oppstår umiddelbart etter den åpne `[` av tegnsettet.
- En `-` må bare escapes hvis den oppstår mellom to bokstaver eller to siffer.

### Kvantifiserere

Uttrykk | Beskrivelse
:--|:--
`{2}` | nøyaktig 2
`{2,}` | minst 2
`{2,7}` | minst 2 men ikke mer enn 7
`*` | 0 eller mer
`+` | 1 eller mer
`?` | nøyaktig 0 eller 1

- Kvantifisereren går *etter* uttrykket som skal kvantifiseres.

### Grenser

Uttrykk | Beskrivelse
:--|:--
`^` | start av streng
`$` | slutt av streng
`\b` | ordgrense

- Hvordan ordgrensetilpasning fungerer:
    - Ved begynnelsen av strengen hvis det første tegnet er `\w`.
    - Mellom to tilstøtende tegn innenfor strengen, hvis det første tegnet er `\w` og det andre tegnet er `\W`.
    - Ved slutten av strengen hvis det siste tegnet er `\w`.

### Tilpasning

Uttrykk | Beskrivelse
:--|:--
`foo\|bar` | matche enten `foo` eller `bar`
`foo(?=bar)` | matche `foo` hvis det er før `bar`
`foo(?!bar)` | matche `foo` hvis det *ikke* er før `bar`
`(?<=bar)foo` | matche `foo` hvis det er etter `bar`
`(?<!bar)foo` | matche `foo` hvis det *ikke* er etter `bar`

### Gruppering og fangst

Uttrykk | Beskrivelse
:--|:--
`(foo)` | fangstgruppe; matche og fange `foo`
`(?:foo)` | ikke-fangstgruppe; matche `foo` men *uten* å fange `foo`
`(foo)bar\1` | `\1` er en bakreferanse til den 1. fangstgruppen; matche `foobarfoo`

- Fangstgrupper er kun relevante i følgende metoder:
    - `string.match(regexp)`
    - `string.matchAll(regexp)`
    - `string.replace(regexp, callback)`
- `\N` er en bakreferanse til den `N-te` fangstgruppen. Fangstgrupper nummereres fra 1.

## Referanser og verktøy

- [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)
- [RegExplained](https://leaverou.github.io/regexplained/)
