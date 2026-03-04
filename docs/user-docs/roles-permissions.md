# 角色与权限说明

## 1. 平台角色

1. `viewer`
2. `member`
3. `admin`
4. `super_admin`

## 2. 权限矩阵

| 能力 | viewer | member | admin | super_admin |
| --- | --- | --- | --- | --- |
| 浏览市场与详情 | Y | Y | Y | Y |
| 登录后台 | N | Y | Y | Y |
| 创建技能（导入） | N | Y | Y | Y |
| 管理本人技能 | N | Y | Y | Y |
| 管理全站技能 | N | N | Y | Y |
| 互动（收藏/评分/评论） | N | Y | Y | Y |
| 删除任意评论 | N | N | Y | Y |
| 管理本人 API Key | N | Y | Y | Y |
| 管理他人 API Key | N | N | N | Y |
| 修改用户角色 | N | N | N | Y |

## 3. 关键规则

1. `viewer` 无后台访问权限
2. `member` 只能管理自己的技能与评论
3. 不允许降级最后一个 `super_admin`

## 4. 角色变更入口

- `POST /admin/users/{userID}/role`（仅 super_admin）
