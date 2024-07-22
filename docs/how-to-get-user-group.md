# How to set user group

我们用“用户组”来控制不同用户可以执行哪些操作

前后端都有需要判断当前用户组的地方

设置用户组的方法，请参考[如何获取用户组](how-to-get-user-group.md)

## 在前端代码中判断用户组

```
user.group.includes('GROUP_NAME')
```

## 在后端代码中判断用户组

```
CRED.employee.includes('GROUP_NAME')
```

以上都返回布尔值，true或false
