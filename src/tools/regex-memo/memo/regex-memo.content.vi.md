### Ký tự thông thường

Biểu thức | Mô tả
:--|:--
`.` hoặc `[^\n\r]` | bất kỳ ký tự nào *ngoại trừ* ký tự xuống dòng hoặc carriage return
`[A-Za-z]` | bảng chữ cái
`[a-z]` | bảng chữ cái thường
`[A-Z]` | bảng chữ cái hoa
`\d` hoặc `[0-9]` | chữ số
`\D` hoặc `[^0-9]` | không phải chữ số
`_` | dấu gạch dưới
`\w` hoặc `[A-Za-z0-9_]` | chữ cái, chữ số hoặc dấu gạch dưới
`\W` hoặc `[^A-Za-z0-9_]` | nghịch đảo của `\w`
`\S` | nghịch đảo của `\s`

### Ký tự khoảng trắng

Biểu thức | Mô tả
:--|:--
` ` | khoảng trắng
`\t` | tab
`\n` | xuống dòng
`\r` | carriage return
`\s` | khoảng trắng, tab, xuống dòng hoặc carriage return

### Tập ký tự

Biểu thức | Mô tả
:--|:--
`[xyz]` | hoặc `x`, hoặc `y`, hoặc `z`
`[^xyz]` | không phải `x`, `y` hoặc `z`
`[1-3]` | hoặc `1`, hoặc `2`, hoặc `3`
`[^1-3]` | không phải `1`, `2` hoặc `3`

- Hãy nghĩ về một tập ký tự như một phép toán `HOẶC` trên các ký tự đơn lẻ được đặt trong dấu ngoặc vuông.
- Sử dụng `^` sau dấu `[` mở để "phủ định" tập ký tự.
- Trong một tập ký tự, `.` có nghĩa là một dấu chấm theo nghĩa đen.

### Ký tự cần escape

#### Bên ngoài tập ký tự

Biểu thức | Mô tả
:--|:--
`\.` | dấu chấm
`\^` | dấu mũ
`\$` | dấu đô la
`\|` | dấu gạch đứng
`\\` | dấu gạch chéo ngược
`\/` | dấu gạch chéo
`\(` | dấu ngoặc mở
`\)` | dấu ngoặc đóng
`\[` | dấu ngoặc vuông mở
`\]` | dấu ngoặc vuông đóng
`\{` | dấu ngoặc nhọn mở
`\}` | dấu ngoặc nhọn đóng

#### Bên trong tập ký tự

Biểu thức | Mô tả
:--|:--
`\\` | dấu gạch chéo ngược
`\]` | dấu ngoặc vuông đóng

- `^` phải được escape chỉ khi nó xuất hiện ngay sau dấu `[` mở của tập ký tự.
- `-` phải được escape chỉ khi nó xuất hiện giữa hai chữ cái hoặc hai chữ số.

### Bộ định lượng

Biểu thức | Mô tả
:--|:--
`{2}` | chính xác 2
`{2,}` | ít nhất 2
`{2,7}` | ít nhất 2 nhưng không quá 7
`*` | 0 hoặc nhiều hơn
`+` | 1 hoặc nhiều hơn
`?` | chính xác 0 hoặc 1

- Bộ định lượng đặt *sau* biểu thức cần được định lượng.

### Ranh giới

Biểu thức | Mô tả
:--|:--
`^` | đầu chuỗi
`$` | cuối chuỗi
`\b` | ranh giới từ

- Cách hoạt động của khớp ranh giới từ:
    - Ở đầu chuỗi nếu ký tự đầu tiên là `\w`.
    - Giữa hai ký tự liền kề trong chuỗi, nếu ký tự đầu tiên là `\w` và ký tự thứ hai là `\W`.
    - Ở cuối chuỗi nếu ký tự cuối cùng là `\w`.

### Khớp

Biểu thức | Mô tả
:--|:--
`foo\|bar` | khớp với `foo` hoặc `bar`
`foo(?=bar)` | khớp với `foo` nếu nó đứng trước `bar`
`foo(?!bar)` | khớp với `foo` nếu nó *không* đứng trước `bar`
`(?<=bar)foo` | khớp với `foo` nếu nó đứng sau `bar`
`(?<!bar)foo` | khớp với `foo` nếu nó *không* đứng sau `bar`

### Nhóm và bắt

Biểu thức | Mô tả
:--|:--
`(foo)` | nhóm bắt; khớp và bắt `foo`
`(?:foo)` | nhóm không bắt; khớp với `foo` nhưng *không* bắt `foo`
`(foo)bar\1` | `\1` là tham chiếu ngược đến nhóm bắt thứ 1; khớp với `foobarfoo`

- Nhóm bắt chỉ liên quan trong các phương thức sau:
    - `string.match(regexp)`
    - `string.matchAll(regexp)`
    - `string.replace(regexp, callback)`
- `\N` là tham chiếu ngược đến nhóm bắt `N-th`. Các nhóm bắt được đánh số bắt đầu từ 1.

## Tài liệu tham khảo và công cụ

- [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)
- [RegExplained](https://leaverou.github.io/regexplained/)
