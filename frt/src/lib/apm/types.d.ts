type ConsoleLayoutType = 'user' | 'admin';
type DashboardLayoutType = ConsoleLayoutType;
type LandPageLayoutType = ConsoleLayoutType;

type NavItemType = {
	label: string;
	url: string;
	baseURL?: string;

	layout?: string;
};
type NavItemsType = NavItemType[];

type NavLayoutType = 'horizontal' | 'vertical';

export {
	ConsoleLayoutType,
	DashboardLayoutType,
	LandPageLayoutType,
	NavItemType,
	NavItemsType,
	NavLayoutType,
};
