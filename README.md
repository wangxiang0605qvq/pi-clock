# pi-clock

pi（pi-coding-agent）扩展：在底部状态栏实时显示日期与时间，每秒刷新。

## 安装

复制 `clock.ts` 到 pi 扩展目录：

```bash
cp clock.ts ~/.pi/agent/extensions/clock.ts
# Windows 默认: D:\pihub\.pi\agent\extensions\
```

然后 `/reload`。

## 用法

| 命令 | 说明 |
| --- | --- |
| `/clock` | 开关时钟 |
| `/clock 12` | 12 小时制 |
| `/clock 24` | 24 小时制 |
