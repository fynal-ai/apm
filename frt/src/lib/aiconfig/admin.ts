function isAdmin(user) {
	if (user === null) {
		return false; // 未登录
	}

	return (
		['AI2NV_OP2'].findIndex((item) => {
			return user.group.includes(item);
		}) > -1
	);
}

export { isAdmin };
