### Caracteres normales

Expresión | Descripción
:--|:--
`.` o `[^\n\r]` | cualquier carácter *excepto* un salto de línea o retorno de carro
`[A-Za-z]` | alfabeto
`[a-z]` | alfabeto en minúsculas
`[A-Z]` | alfabeto en mayúsculas
`\d` o `[0-9]` | dígito
`\D` o `[^0-9]` | no dígito
`_` | guion bajo
`\w` o `[A-Za-z0-9_]` | alfabeto, dígito o guion bajo
`\W` o `[^A-Za-z0-9_]` | inverso de `\w`
`\S` | inverso de `\s`

### Caracteres de espacio en blanco

Expresión | Descripción
:--|:--
` ` | espacio
`\t` | tabulador
`\n` | salto de línea
`\r` | retorno de carro
`\s` | espacio, tabulador, salto de línea o retorno de carro

### Conjunto de caracteres

Expresión | Descripción
:--|:--
`[xyz]` | ya sea `x`, `y` o `z`
`[^xyz]` | ni `x`, ni `y`, ni `z`
`[1-3]` | ya sea `1`, `2` o `3`
`[^1-3]` | ni `1`, ni `2`, ni `3`

- Piense en un conjunto de caracteres como una operación `OR` en los caracteres individuales que están encerrados entre los corchetes.
- Use `^` después del `[` de apertura para "negar" el conjunto de caracteres.
- Dentro de un conjunto de caracteres, `.` significa un punto literal.

### Caracteres que requieren escape

#### Fuera de un conjunto de caracteres

Expresión | Descripción
:--|:--
`\.` | punto
`\^` | acento circunflejo
`\$` | signo de dólar
`\|` | barra vertical
`\\` | barra invertida
`\/` | barra diagonal
`\(` | corchete de apertura
`\)` | corchete de cierre
`\[` | corchete cuadrado de apertura
`\]` | corchete cuadrado de cierre
`\{` | llave de apertura
`\}` | llave de cierre

#### Dentro de un conjunto de caracteres

Expresión | Descripción
:--|:--
`\\` | barra invertida
`\]` | corchete cuadrado de cierre

- Un `^` debe escaparse solo si ocurre inmediatamente después del `[` de apertura del conjunto de caracteres.
- Un `-` debe escaparse solo si ocurre entre dos letras o dos dígitos.

### Cuantificadores

Expresión | Descripción
:--|:--
`{2}` | exactamente 2
`{2,}` | al menos 2
`{2,7}` | al menos 2 pero no más de 7
`*` | 0 o más
`+` | 1 o más
`?` | exactamente 0 o 1

- El cuantificador va *después* de la expresión a cuantificar.

### Límites

Expresión | Descripción
:--|:--
`^` | inicio de cadena
`$` | fin de cadena
`\b` | límite de palabra

- Cómo funciona la coincidencia de límite de palabra:
    - Al principio de la cadena si el primer carácter es `\w`.
    - Entre dos caracteres adyacentes dentro de la cadena, si el primer carácter es `\w` y el segundo carácter es `\W`.
    - Al final de la cadena si el último carácter es `\w`.

### Coincidencia

Expresión | Descripción
:--|:--
`foo\|bar` | coincidir con `foo` o `bar`
`foo(?=bar)` | coincidir con `foo` si está antes de `bar`
`foo(?!bar)` | coincidir con `foo` si *no* está antes de `bar`
`(?<=bar)foo` | coincidir con `foo` si está después de `bar`
`(?<!bar)foo` | coincidir con `foo` si *no* está después de `bar`

### Agrupación y captura

Expresión | Descripción
:--|:--
`(foo)` | grupo de captura; coincidir y capturar `foo`
`(?:foo)` | grupo no capturador; coincidir con `foo` pero *sin* capturar `foo`
`(foo)bar\1` | `\1` es una referencia inversa al 1er grupo de captura; coincidir con `foobarfoo`

- Los grupos de captura solo son relevantes en los siguientes métodos:
    - `string.match(regexp)`
    - `string.matchAll(regexp)`
    - `string.replace(regexp, callback)`
- `\N` es una referencia inversa al grupo de captura `N-ésimo`. Los grupos de captura se numeran comenzando desde 1.

## Referencias y herramientas

- [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)
- [RegExplained](https://leaverou.github.io/regexplained/)
