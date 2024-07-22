import { notifyMessage } from './Stores';
export const countdownToast = (
	initialMsg: string,
	title: string,
	type: string,
	pos: string,
	duration: number
) => {
	let secondsLeft = duration;
	const updateMessage = () => {
		if (secondsLeft > 0) {
			notifyMessage.set({ msg: `${initialMsg}（${secondsLeft}秒后自动跳转）`, title, type, pos });
			secondsLeft--;
			setTimeout(updateMessage, 1000);
		}
	};
	updateMessage();
};
