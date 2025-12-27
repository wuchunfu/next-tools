## Cấu hình

Đặt cấu hình toàn cục

```shell
git config --global user.name "[name]"
git config --global user.email "[email]"
```

## Bắt đầu

Tạo một kho lưu trữ git

```shell
git init
```

Sao chép một kho lưu trữ git hiện có

```shell
git clone [url]
```

## Commit

Commit tất cả các thay đổi đã theo dõi

```shell
git commit -am "[commit message]"
```

Thêm các sửa đổi mới vào commit cuối cùng

```shell
git commit --amend --no-edit
```

## Tôi đã mắc lỗi

Thay đổi thông báo commit cuối cùng

```shell
git commit --amend
```

Hoàn tác commit gần nhất và giữ lại các thay đổi

```shell
git reset HEAD~1
```

Hoàn tác `N` commit gần nhất và giữ lại các thay đổi

```shell
git reset HEAD~N
```

Hoàn tác commit gần nhất và loại bỏ các thay đổi

```shell
git reset HEAD~1 --hard
```

Đặt lại nhánh về trạng thái từ xa

```shell
git fetch origin
git reset --hard origin/[branch-name]
```

## Khác

Đổi tên nhánh master cục bộ thành main

```shell
git branch -m master main
```
