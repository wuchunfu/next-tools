### Caracteres normais

Expressão | Descrição
:--|:--
`.` ou `[^\n\r]` | qualquer caractere *exceto* uma quebra de linha ou retorno de carro
`[A-Za-z]` | alfabeto
`[a-z]` | alfabeto minúsculo
`[A-Z]` | alfabeto maiúsculo
`\d` ou `[0-9]` | dígito
`\D` ou `[^0-9]` | não dígito
`_` | sublinhado
`\w` ou `[A-Za-z0-9_]` | alfabeto, dígito ou sublinhado
`\W` ou `[^A-Za-z0-9_]` | inverso de `\w`
`\S` | inverso de `\s`

### Caracteres de espaço em branco

Expressão | Descrição
:--|:--
` ` | espaço
`\t` | tabulação
`\n` | quebra de linha
`\r` | retorno de carro
`\s` | espaço, tabulação, quebra de linha ou retorno de carro

### Conjunto de caracteres

Expressão | Descrição
:--|:--
`[xyz]` | seja `x`, `y` ou `z`
`[^xyz]` | nem `x`, nem `y`, nem `z`
`[1-3]` | seja `1`, `2` ou `3`
`[^1-3]` | nem `1`, nem `2`, nem `3`

- Pense em um conjunto de caracteres como uma operação `OU` nos caracteres individuais que estão entre os colchetes.
- Use `^` após o `[` de abertura para "negar" o conjunto de caracteres.
- Dentro de um conjunto de caracteres, `.` significa um ponto literal.

### Caracteres que requerem escape

#### Fora de um conjunto de caracteres

Expressão | Descrição
:--|:--
`\.` | ponto
`\^` | acento circunflexo
`\$` | cifrão
`\|` | barra vertical
`\\` | barra invertida
`\/` | barra
`\(` | parêntese de abertura
`\)` | parêntese de fechamento
`\[` | colchete de abertura
`\]` | colchete de fechamento
`\{` | chave de abertura
`\}` | chave de fechamento

#### Dentro de um conjunto de caracteres

Expressão | Descrição
:--|:--
`\\` | barra invertida
`\]` | colchete de fechamento

- Um `^` deve ser escapado apenas se ocorrer imediatamente após o `[` de abertura do conjunto de caracteres.
- Um `-` deve ser escapado apenas se ocorrer entre duas letras ou dois dígitos.

### Quantificadores

Expressão | Descrição
:--|:--
`{2}` | exatamente 2
`{2,}` | pelo menos 2
`{2,7}` | pelo menos 2 mas não mais que 7
`*` | 0 ou mais
`+` | 1 ou mais
`?` | exatamente 0 ou 1

- O quantificador vai *depois* da expressão a ser quantificada.

### Limites

Expressão | Descrição
:--|:--
`^` | início da string
`$` | fim da string
`\b` | limite de palavra

- Como funciona a correspondência de limite de palavra:
    - No início da string se o primeiro caractere for `\w`.
    - Entre dois caracteres adjacentes dentro da string, se o primeiro caractere for `\w` e o segundo caractere for `\W`.
    - No fim da string se o último caractere for `\w`.

### Correspondência

Expressão | Descrição
:--|:--
`foo\|bar` | corresponder a `foo` ou `bar`
`foo(?=bar)` | corresponder a `foo` se estiver antes de `bar`
`foo(?!bar)` | corresponder a `foo` se *não* estiver antes de `bar`
`(?<=bar)foo` | corresponder a `foo` se estiver depois de `bar`
`(?<!bar)foo` | corresponder a `foo` se *não* estiver depois de `bar`

### Agrupamento e captura

Expressão | Descrição
:--|:--
`(foo)` | grupo de captura; corresponder e capturar `foo`
`(?:foo)` | grupo não capturador; corresponder a `foo` mas *sem* capturar `foo`
`(foo)bar\1` | `\1` é uma referência inversa ao 1º grupo de captura; corresponder a `foobarfoo`

- Grupos de captura são relevantes apenas nos seguintes métodos:
    - `string.match(regexp)`
    - `string.matchAll(regexp)`
    - `string.replace(regexp, callback)`
- `\N` é uma referência inversa ao grupo de captura `N-ésimo`. Grupos de captura são numerados a partir de 1.

## Referências e ferramentas

- [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)
- [RegExplained](https://leaverou.github.io/regexplained/)
