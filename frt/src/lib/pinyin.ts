import pinyin from 'chinese-to-pinyin';

export const getPinyin = (str: string) => {
	return pinyin(str, { removeTone: true });
};

export function getRandomChineseCharacter() {
	// Range of common Chinese characters in Unicode
	const min = 0x4e00;
	const max = 0x9fff;
	// Generate a random code point in this range
	const codePoint = Math.floor(Math.random() * (max - min + 1)) + min;
	// Convert the code point to a string (Chinese character)
	return String.fromCodePoint(codePoint);
}

export function getRandomChineseCompanyName() {
	let name = '';
	const nameLength = Math.floor(Math.random() * 6) + 5; // Name length between 2 and 4 characters
	for (let i = 0; i < nameLength; i++) {
		name += getRandomChineseCharacter();
	}
	return name;
}
