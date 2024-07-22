import { API_SERVER } from '$lib/Env';
import { Software } from './Software';
import type { DirectoryLayout } from './types';

function replaceURLSearch(url, key, value) {
	url = new URL(url);

	if (!value) {
		url.searchParams.delete(key);
	} else {
		url.searchParams.set(key, value);
	}

	return url.pathname + decodeURIComponent(url.search);
}

function replaceURLSearchPath(url, path) {
	return replaceURLSearch(url, 'path', path);
}
function replaceURLSearchLayout(url, layout: DirectoryLayout) {
	return replaceURLSearch(url, 'layout', layout);
}

// 以 / 开头
function joinPath(path, name) {
	if (path === '/') {
		path = '/' + name;
	} else {
		if (path.endsWith('/') === false) {
			path = path + '/';
		}
		path = path + name;
	}

	return path;
}

function convertToWindowsStandardPath(path) {
	const names = path.split('/').filter((a) => {
		return a;
	});
	const a = names[0]; // 第一个是盘符

	return a.toUpperCase() + ':/' + names.slice(1).join('/');
}

// 1-10[1]
function decodeFramesString(frames) {
	return {
		start_frame: frames?.split('-')?.[0] || '',
		end_frame: frames?.split('-')?.[1]?.split('[')?.[0] || '',
		offset_frame: frames?.split('[')?.[1]?.split(']')?.[0] || '',
	};
}
function encodeFramesString(frames) {
	return `${frames.start_frame}-${frames.end_frame}[${frames.offset_frame}]`;
}

function getFileExtension(filename) {
	return filename.split('.').pop().toLowerCase();
}

let SOFTWARE = new Software();
SOFTWARE.updateConfig();
function fileExtensionToSoftwareCGName(extension) {
	return SOFTWARE.getCGNameByExtension(extension);
}
function getSoftwareCGNames() {
	return SOFTWARE.getCGNames();
}
function getSoftwareVersionsByCGName(cg_name) {
	return SOFTWARE.getCGVersions(cg_name);
}
function getSoftwarePluginsByCGName(cg_name, cg_version) {
	return SOFTWARE.getCGPlugins(cg_name, cg_version);
}
function getSoftwarePluginsVersionsByCGName(cg_name, cg_version, plugin_name) {
	return SOFTWARE.getCGPluginsVersions(cg_name, cg_version, plugin_name);
}

function downloadBlobToFile(filename, blob) {
	const link = document.createElement('a');
	link.download = decodeURIComponent(filename);
	link.style.display = 'none';
	link.href = URL.createObjectURL(blob);
	document.body.appendChild(link);
	link.click();
	URL.revokeObjectURL(link.href);
	document.body.removeChild(link);
}

async function fetchRemoteFile(path, token) {
	return await fetch(`${API_SERVER}/airender/preview`, {
		method: 'POST',

		body: JSON.stringify({ path }),

		headers: {
			'Content-Type': 'application/json',
			Authorization: token,
		},
	});
}

function generateDrivesList() {
	return [...Array(26).keys()].map((i) => String.fromCharCode(i + 65));
}
function isDrive(a) {
	return /^[A-Z]$/.test(a);
}

function canCreateRenderTask(file) {
	return file?.isFile && SOFTWARE.isFileNameSupported(file.name);
}
function canStopRenderTask(task) {
	return ['pending', 'notstart', 'underway'].includes(task.status);
}
function canPreivewTaskSmall(task) {
	return task.status === 'finished' || task.finished > 0;
}
function canReRenderTask(task) {
	return ['failure', 'stopped'].includes(task.status);
}
function canPreviewTaskLog(task) {
	return ['failure', 'finished', 'stopped'].includes(task.status);
}

function canStopUploadTask(task) {
	return ['pending', 'notstart', 'underway'].includes(task.status);
}
function canReUploadTask(task) {
	return ['finished', 'stopped', 'failure'].includes(task.status);
}

// 是否能展示render_node
function canShowRenderNode(scene_info) {
	if (SOFTWARE.isHoudiniFile(scene_info.input_cg_file)) {
		return true;
	}
	return scene_info.renderer_list && scene_info.renderer_list.length > 0;
}

function isAdmin(user) {
	if (user === null) {
		return false; // 未登录
	}

	return (
		['AI2NV_AIRENDER'].findIndex((item) => {
			return user.group.includes(item);
		}) > -1
	);
}
function isDispatcherClient(user) {
	if (user === null) {
		return false; // 未登录
	}

	return (
		['AIRENDER_DISPATCHER'].findIndex((item) => {
			return user.group.includes(item);
		}) > -1
	);
}

function formatFee(fee) {
	return parseFloat(fee).toFixed(4);
}

function formatBalance(balance) {
	return parseFloat(balance).toFixed(2);
}

export {
	SOFTWARE,
	canCreateRenderTask,
	canPreivewTaskSmall,
	canPreviewTaskLog,
	canReRenderTask,
	canReUploadTask,
	canShowRenderNode,
	canStopRenderTask,
	canStopUploadTask,
	convertToWindowsStandardPath,
	decodeFramesString,
	downloadBlobToFile,
	encodeFramesString,
	fetchRemoteFile,
	fileExtensionToSoftwareCGName,
	formatBalance,
	formatFee,
	generateDrivesList,
	getFileExtension,
	getSoftwareCGNames,
	getSoftwarePluginsByCGName,
	getSoftwarePluginsVersionsByCGName,
	getSoftwareVersionsByCGName,
	isAdmin,
	isDispatcherClient,
	isDrive,
	joinPath,
	replaceURLSearch,
	replaceURLSearchLayout,
	replaceURLSearchPath,
};
