import { notifyMessage } from '$lib/Stores';

export function setFadeMessage(msg: string, type: string = 'light', title: string = '') {
	notifyMessage.set({
		msg: msg,
		title: title,
		type: type,
	});
}
