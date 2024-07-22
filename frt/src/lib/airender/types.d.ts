type DirectoryLayout = 'grid' | 'list';

type TaskListLayout =
	| 'airender'
	| 'aiops'
	| 'cognihub.app'
	| 'cognihub.app.service'
	| 'cognihub.user'
	| 'cognihub.service'
	| 'cognihub.package'
	| 'cognihub.sale.payway'
	| 'cognihub.balance.admin'
	| 'cognihub.bill'
	| 'cognihub.bill.admin'
	| 'cognihub.trade.admin'
	| 'cognihub.trade'; // 任务列表布局

type TaskListItem = {
	value: string;
	label?: string;

	valueRender?: Promise;

	input?: string | any;
	clickable?: boolean;
	onClick?: function;

	showCopy?: boolean;

	layout?: any;
	withoutClass?: boolean;
	class?: string;
	style?: string;

	layout?: TaskListLayout;
}; // 任务列表项
type TaskListItems = TaskListItem[]; // 任务列表项数组

type OperationLayout = 'row' | 'column' | 'table-column';
type OperationItemType = {
	class: string;
	title: string;
	visible?: function;
	onClick?: function;

	showTitle?: boolean;
};
type OperationItemsType = OperationItemType[];

type PaywayType = 'system' | 'balance' | 'alipay' | 'wechat_pay' | 'union_pay';

export {
	DirectoryLayout,
	OperationItemType,
	OperationItemsType,
	OperationLayout,
	PaywayType,
	TaskListItem,
	TaskListItems,
	TaskListLayout,
};
