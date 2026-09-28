/**
 * 实时时钟扩展 (Realtime Clock Extension)
 *
 * 在 pi 底部状态栏实时显示当前日期与时间，每秒刷新一次。
 *
 * 安装位置：~/.pi/agent/extensions/clock.ts（全局 + 自动发现，可用 /reload 热重载）
 *
 * 命令：
 *   /clock        开启 / 关闭时钟
 *   /clock 12     使用 12 小时制
 *   /clock 24     使用 24 小时制
 *
 * 实现说明：
 *   ctx.ui.setStatus(key, text) 是“即发即忘”的状态接口，每次调用都会触发一次
 *   重绘（源码中 setExtensionStatus 内部会调用 ui.requestRender()），因此这里用
 *   一个每秒触发的定时器不断刷新状态文本即可实现实时时钟。
 *
 *   按照官方约定，定时器等长生命周期资源不能在扩展工厂函数里启动（工厂可能在
 *   不启动会话的调用中执行），而应在 session_start 中启动，并在 session_shutdown
 *   里清理，避免资源泄漏。
 */

import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";

const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"] as const;

function pad(n: number): string {
	return String(n).padStart(2, "0");
}

/** 把 Date 格式化为 “HH:mm:ss” / “上午 hh:mm:ss” */
function formatClock(d: Date, hour12: boolean): string {
	if (!hour12) {
		return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
	}
	let h = d.getHours();
	const meridiem = h < 12 ? "上午" : "下午";
	h %= 12;
	if (h === 0) h = 12;
	return `${meridiem} ${pad(h)}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/** 把 Date 格式化为日期 + 星期，例如 “2026-09-21 周日” */
function formatDate(d: Date): string {
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${WEEKDAYS[d.getDay()]}`;
}

export default function (pi: ExtensionAPI) {
	let timer: ReturnType<typeof setInterval> | null = null;
	let enabled = true;
	let hour12 = false;

	function render(ctx: ExtensionContext): void {
		if (!enabled) return;
		const theme = ctx.ui.theme;
		const now = new Date();
		const icon = theme.fg("dim", "🕐 ");
		const clock = theme.fg("accent", formatClock(now, hour12));
		const date = theme.fg("dim", ` ${formatDate(now)}`);
		ctx.ui.setStatus("clock", icon + clock + date);
	}

	function stop(ctx: ExtensionContext): void {
		if (timer !== null) {
			clearInterval(timer);
			timer = null;
		}
		if (ctx.hasUI) {
			ctx.ui.setStatus("clock", undefined);
		}
	}

	function start(ctx: ExtensionContext): void {
		stop(ctx);
		// 无 UI（print / json 模式）时不需要也不应启动定时器
		if (!ctx.hasUI) return;
		render(ctx);
		timer = setInterval(() => render(ctx), 1000);
	}

	pi.on("session_start", async (_event, ctx) => {
		// 每次启动 / 重载 / 新建 / 恢复会话时重新建立时钟
		start(ctx);
	});

	pi.on("session_shutdown", async (_event, ctx) => {
		// 退出 / 重载 / 切换会话前清理定时器
		stop(ctx);
	});

	// 提供一个命令用于手动开关或切换制式
	pi.registerCommand("clock", {
		description: "开关实时时钟，或设置 12/24 小时制（/clock、/clock 12、/clock 24）",
		handler: async (args, ctx) => {
			const arg = (args ?? "").trim().toLowerCase();

			if (arg === "12" || arg === "24") {
				hour12 = arg === "12";
				enabled = true;
				start(ctx);
				ctx.ui.notify(`时钟已使用 ${arg} 小时制`, "info");
				return;
			}

			enabled = !enabled;
			if (enabled) {
				start(ctx);
				ctx.ui.notify("时钟已开启", "info");
			} else {
				stop(ctx);
				ctx.ui.notify("时钟已关闭", "info");
			}
		},
	});
}
