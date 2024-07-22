import { notifyMessage } from './Stores';
export const toast = (
	msg: string,
	title: string = '',
	type: string = 'info',
	pos: string = 'center',
	duration: number = 3,
) => {
	notifyMessage.set({ msg, title, type, pos, duration });
};
