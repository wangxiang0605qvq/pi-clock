# pi-clock

pi（pi-coding-agent）扩展：在底部状态栏实时显示日期与时间，每秒刷新。

## 安装

### 方式一：作为 pi 包安装（推荐）

```bash
pi install git:github.com/wangxiang0605qvq/pi-clock
```

### 方式二：手动复制

复制 `clock.ts` 到 pi 扩展目录：

```bash
cp clock.ts ~/.pi/agent/extensions/clock.ts
```

然后 `/reload`。

## 用法

| 命令 | 说明 |
| --- | --- |
| `/clock` | 开关时钟 |
| `/clock 12` | 12 小时制 |
| `/clock 24` | 24 小时制 |
