<script lang="ts">
	import { _ } from '$lib/i18n';
	import { page } from '$app/stores';
	import { API_SERVER, UPLOAD_MAX_FILE_SIZE } from '$lib/Env';
	import FilePond, { registerPlugin } from 'svelte-filepond';
	// Import the plugin code
	import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
	import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';

	// Register the plugin
	import { createEventDispatcher } from 'svelte';
	import './FileUploaderStyle.css';
	const dispatch = createEventDispatcher();
	let user = $page.data.user;
	export let uploadedFiles: any[] = [];
	//传递给FilePond部件
	export let allowRemove = false;
	//传递给FilePond部件
	export let allowMultiple = false;
	//for开头的变量不是FilePond的，而是MTC用到的，用于区分每个文件的业务归属
	export let forWhat: string;
	export let forWhich = '';
	export let forKey = '';
	export let forKvar = '';
	export let stepid = '';

	//遵循 FilePondPluginFileValidateType中的定义
	export let acceptedFileTypes = undefined;
	//遵循 FilePondPluginFileValidateSize中的定义
	export let maxFileSize = UPLOAD_MAX_FILE_SIZE ?? '10MB';
	//用于控制单次可以上传多少个文件
	let maxFiles = forKey === 'pbo' ? 10 : 10;

	// Import the Image EXIF Orientation and Image Preview plugins
	// Note: These need to be installed separately
	// `npm i filepond-plugin-image-preview filepond-plugin-image-exif-orientation --save`
	//import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
	//import FilePondPluginImagePreview from 'filepond-plugin-image-preview';

	// Register the plugins
	//registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);
	//FilePond.registerPlugin(FilePondPluginFileValidateSize);
	registerPlugin(FilePondPluginFileValidateSize, FilePondPluginFileValidateType);
	let serverUrl: string = API_SERVER + '/filepond';

	// a reference to the component, used to call FilePond methods
	let pond: any;

	// pond.getFiles() will return the active files

	// the name to use for the internal file input
	let name = 'filepond';

	// handle filepond events
	function handleInit() {
		console.log('FilePond has initialised');
	}

	function handleAddFile(err, fileItem) {
		dispatch('uploading', 'Uploading');
	}
	function handleRemoveFile(err, fileItem) {
		recheckFiles();
		dispatch('remove', fileItem);
	}
	function handleProcessFile(err, fileItem) {
		console.log('A file has been processed', fileItem.id, fileItem.serverId, fileItem);
	}
	function handleProcessFiles(err) {
		recheckFiles();
		dispatch('uploaded', uploadedFiles);
	}
	function handleWarning(err) {
		recheckFiles();
		dispatch('warning', uploadedFiles);
	}
	function handleError(err) {
		recheckFiles();
		dispatch('error', uploadedFiles);
	}
	function recheckFiles() {
		let pondFiles = pond.getFiles();
		uploadedFiles = pondFiles.map((f) => {
			return {
				id: f.id,
				serverId: f.serverId,
				realName: f.filename,
				contentType: f.fileType,
				stepid: stepid,
			};
		});
		uploadedFiles = uploadedFiles.filter((x) => x.serverId);
	}
</script>

{$_('filepond.info', {
	values: {
		key: forKey,
		allowMultiple: $_(allowMultiple ? 'filepond.multiple' : 'filepond.single', {
			values: { maxFiles: maxFiles },
		}),
		accept: acceptedFileTypes === undefined ? $_('filepond.anytype') : acceptedFileTypes,

		maxFileSize: maxFileSize,
	},
})}
<FilePond
	bind:this={pond}
	{name}
	oninit={handleInit}
	onaddfile={handleAddFile}
	onremovefile={handleRemoveFile}
	onprocessfile={handleProcessFile}
	onprocessfiles={handleProcessFiles}
	onwarning={handleWarning}
	onerror={handleError}
	allowRevert={true}
	{allowRemove}
	{allowMultiple}
	{maxFiles}
	{maxFileSize}
	{acceptedFileTypes}
	labelIdle={forKvar
		? `<i class='bi bi-cloud-arrow-up fs-5'/><div class='fs-6'>${$_(
				'filepond.labelIdle.kvar',
		  )}</div>`
		: forKey === 'pbo'
		? `<i class='bi bi-cloud-arrow-up fs-3'/><div class="fs-6">${$_(
				'filepond.labelIdle.pbo',
		  )}</div>`
		: `<i class='bi bi-cloud-arrow-up fs-3'/><div class="fs-6">${$_(
				'filepond.labelIdle.pbo',
		  )}</div>`}
	labelFileProcessingComplete={$_('filepond.labelFileProcessingComplete')}
	labelTapToUndo={$_('filepond.labelTapToUndo')}
	labelTapToRetry={$_('filepond.labelTapToRetry')}
	labelTapToCancel={$_('filepond.labelTapToCancel')}
	server={{
		url: serverUrl,
		process: {
			url: '/process',
			headers: {
				authorization: user.sessionToken,
			},
			ondata: (formData) => {
				formData.append('forWhat', forWhat);
				formData.append('forWhich', forWhich);
				formData.append('forKey', forKey);
				return formData;
			},
		},
		// revert: {
		// 	url: '/revert',
		// 	headers: {
		// 		authorization: user.sessionToken,
		// 	},
		// },
		revert: (uniqueFileId, load, error) => {
			// Should remove the earlier created temp file here
			// ...

			console.log(uniqueFileId);
			// Can call the error method if something is wrong, should exit after
			// error('oh my goodness');

			// Should call the load method when done, no parameters required
			load();
		},
		restore: '/restore?id=',
		fetch: '/fetch?data=',
	}} />
