export const HomeLayouts = {
	lg: [
		{ i: "summary", x: 0, y: 0, w: 1, h: 1, isResizable: false, minW: 1, maxW: 1, minH:1, maxH: 1},
		{ i: "upcoming-tasks", x: 1, y: 0, w: 2, h: 1, isResizable: true, minW: 2, maxW: 2, minH:1, maxH: 2},
		{ i: "new-features", x: 0, y: 1, w: 2, h: 1, isResizable: false },
		{ i: "overdue-tasks", x: 2, y: 1, w: 1, h: 1, isResizable: false },
		{ i: "today-tasks", x: 0, y: 2, w: 2, h: 1, isResizable: false },
		{ i: "weather", x: 2, y: 2, w: 1, h: 1, isResizable: false },
	],
	md: [
		{ i: "summary", x: 0, y: 0, w: 1, h: 1, isResizable: false},
		{ i: "upcoming-tasks", x: 0, y: 1, w: 2, h: 1, isResizable: false },
		{ i: "new-features", x: 0, y: 2, w: 2, h: 1, isResizable: false },
		{ i: "overdue-tasks", x: 1, y: 0, w: 1, h: 1, isResizable: false },
		{ i: "today-tasks", x: 0, y: 3, w: 1, h: 1, isResizable: false },
		{ i: "weather", x: 1, y: 3, w: 1, h: 1, isResizable: false },
	],
	xs: [
		{ i: "summary", x: 0, y: 0, w: 2, h: 1, static: false },
		{ i: "upcoming-tasks", x: 0, y: 1, w: 1, h: 1, static: false },
		{ i: "new-features", x: 0, y: 4, w: 1, h: 1, static: false },
		{ i: "overdue-tasks", x: 0, y: 2, w: 1, h: 1, static: false },
		{ i: "today-tasks", x: 1, y: 3, w: 1, h: 1, static: false },
		{ i: "weather", x: 0, y: 5, w: 1, h: 1, static: false },
	],
};