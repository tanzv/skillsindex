# SkillsIndex 用户操作手册

## 1. 适用范围

本手册面向 SkillsIndex 的最终使用者，覆盖：

1. 普通用户（游客、登录用户、member）
2. 管理员（admin、super_admin）
3. API 使用方（通过 API Key 调用公开接口）

## 2. 文档目录

1. `getting-started.md`：快速开始（安装、启动、首次登录）
2. `local-development-launch-code.md`：本地开发启动（`lcode`、环境变量、日志与停止）
3. `local-development-quick-reference.md`：本地开发速查卡（启动、日志、停止）
4. `deployment-upgrade-operations.md`：部署、升级、重启与 bootstrap 操作说明
5. `roles-permissions.md`：角色与权限说明
6. `user-portal-guide.md`：用户端功能操作（市场、详情、互动）
7. `admin-console-guide.md`：管理后台操作（导入、治理、审计、用户）
8. `api-usage-guide.md`：API Key 与公开 API 调用说明
9. `dingtalk-authorization-guide.md`：钉钉授权接入与使用
10. `faq-troubleshooting.md`：常见问题与排障

## 3. 功能完整性声明

本手册覆盖当前已实现的 Web 功能（用户端与管理端）。

如你需要“目标态（待实现）”能力，请参考需求设计文档：

- `docs/design-requirements/overview/functional-coverage-matrix.md`
- `docs/design-requirements/auth-rbac/account-management.md`
