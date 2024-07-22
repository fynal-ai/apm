import { API_SERVER } from '$lib/Env';
import * as api from '$lib/api';
import { formatSeconds } from '$lib/dit';
import axios from 'axios';
import SparkMD5 from 'spark-md5';

// 记录文件uuid
async function getFileUUID(file: File) {
	return await getHashBysparkMD5(file);
}

async function getHashBysparkMD5(file) {
	return new Promise((resolve, reject) => {
		var blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
			// file = this.files[0],
			chunkSize = 2097152, // Read in chunks of 2MB
			chunks = Math.ceil(file.size / chunkSize),
			currentChunk = 0,
			spark = new SparkMD5.ArrayBuffer(),
			fileReader = new FileReader();

		fileReader.onload = function (e) {
			// console.log('read chunk nr', currentChunk + 1, 'of', chunks);
			spark.append(e.target.result); // Append array buffer
			currentChunk++;

			if (currentChunk < chunks) {
				loadNext();
			} else {
				console.log('finished loading');
				const hash = spark.end();
				console.info('computed hash', hash); // Compute hash

				resolve(hash);
			}
		};

		fileReader.onerror = function (e) {
			console.warn('oops, something went wrong.');

			reject(e);
		};

		function loadNext() {
			var start = currentChunk * chunkSize,
				end = start + chunkSize >= file.size ? file.size : start + chunkSize;

			fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
		}

		loadNext();
	});
}

class UploadFile {
	sessionToken: string;
	file: File;
	filename: string;
	uuid?: any;
	progress: any;
	abortController?: AbortController;
	chunkSize = 2 * 1024 * 1024; // 2MB
	constructor(sessionToken, file, filename) {
		this.sessionToken = sessionToken;
		this.file = file;
		this.filename = filename;
	}
	async start() {
		this.abortController = new AbortController();

		this.updateProgress({
			file: this.file,

			name: this.file.name,
			size: this.file.size,

			status: 'underway',
			progress: 0,

			abortController: this.abortController,

			start_time: new Date(),
			end_time: undefined,
			duration: undefined,
		});

		if (!this.uuid) {
			this.uuid = await getFileUUID(this.file);
		}

		// 去重
		{
			const response = await api.post(
				`/airender/assets/upload/exists`,
				{
					filename: this.filename,
					uuid: this.uuid,
				},
				this.sessionToken
			);
			if (response.name) {
				this.updateProgress({
					status: 'finished',
					progress: 100,
					end_time: new Date(),
					duration: this.computeProgressDuration(this.progress.start_time, new Date()),
				}); // 进度

				return;
			}
		}

		// 上传文件
		return await this.postFile();
	}
	async postFile() {
		let response: any = {};

		// 分片上传
		if (this.file.size > this.chunkSize) {
			console.log('分片上传', this.file.name, this.file.size, this.chunkSize);
			response = await this.postFileByChunks(this.file, this.abortController);
		} else {
			console.log('直接上传', this.file.name, this.file.size, this.chunkSize);
			response = await this.postFileBySingle(this.file, this.abortController);
		}

		return response;
	}
	async postFileByChunks(file, abortController) {
		// 获取已有的分片
		let totalChunks = Math.ceil(file.size / this.chunkSize); // 切片总数
		let restChunksIndexes: any = []; // 剩余未上传切片
		{
			const response = await api.post(
				`/airender/assets/upload/chunks/search`,
				{
					uuid: this.uuid,
					size: this.file.size,
					chunkSize: this.chunkSize,

					exists: false,
				},
				this.sessionToken
			);

			// 查找分片失败时
			if (response.error) {
				this.updateProgress({
					status: 'failure',
					progress: 100,
					end_time: new Date(),
					duration: this.computeProgressDuration(this.progress.start_time, new Date()),
				});
				return;
			}

			// 存在未上传的分片
			if (response.length > 0) {
				restChunksIndexes = response;

				this.updateProgress({
					progress: parseFloat(
						(((totalChunks - restChunksIndexes.length) / totalChunks) * 100).toFixed(2)
					),
				}); // 进度
			}
		}

		// 分片上传
		let failureChunksIndexes: any = [];
		if (restChunksIndexes.length > 0) {
			for (let i = 0; i < restChunksIndexes.length; i = i + 1) {
				const restChunkIndex: any = restChunksIndexes[i];

				const chunkFile = file.slice(
					restChunkIndex * this.chunkSize,
					(restChunkIndex + 1) * this.chunkSize
				);

				const response = await this.postChunk(
					chunkFile,
					abortController,
					this.chunkSize,
					restChunkIndex
				);
				if (!response?.name) {
					failureChunksIndexes.push(restChunkIndex);
				}

				this.updateProgress({
					progress: parseFloat(
						(
							((totalChunks - restChunksIndexes.length + (i + 1) - failureChunksIndexes.length) /
								totalChunks) *
							100
						).toFixed(2)
					),
				}); // 进度
			}
		}

		// 仍有未上传的切片
		if (failureChunksIndexes.length > 0) {
			this.updateProgress({
				status: 'failure',
				end_time: new Date(),
				duration: this.computeProgressDuration(this.progress.start_time, new Date()),
			});
			return;
		}

		// 合并文件
		{
			const response = await api.post(
				`/airender/assets/upload/chunks/merge`,
				{ filename: this.filename, uuid: this.uuid, chunkSize: this.chunkSize, totalChunks },
				this.sessionToken
			);

			if (response.name) {
				this.updateProgress({
					status: 'finished',
					progress: 100,
					end_time: new Date(),
					duration: this.computeProgressDuration(this.progress.start_time, new Date()),
				}); // 进度

				return {
					name: response.name,

					isFile: true,
					isDirectory: false,
				};
			}

			this.updateProgress({
				status: 'failure',
				progress: 100,
				end_time: new Date(),
				duration: this.computeProgressDuration(this.progress.start_time, new Date()),
			});
		}
	}
	async postChunk(chunkFile, abortController, chunkSize, chunkIndex) {
		const formData = new FormData();
		formData.append('file', chunkFile);
		formData.append('filename', this.filename);
		formData.append('currentChunkSize', chunkFile.size);
		formData.append('uuid', this.uuid);
		formData.append('chunkSize', chunkSize);
		formData.append('chunkIndex', chunkIndex);

		try {
			const response: any = await axios(`${API_SERVER}/airender/assets/upload/chunks/upload`, {
				method: 'POST',
				headers: {
					authorization: this.sessionToken,
				},
				data: formData,
				signal: abortController.signal,
			});

			return {
				name: response.data.name,

				isFile: true,
				isDirectory: false,
			};
		} catch (error) {
			this.updateProgress({
				status: 'failure',
				progress: 100,
				end_time: new Date(),
				duration: this.computeProgressDuration(this.progress.start_time, new Date()),
			});
		}
	}
	async postFileBySingle(file, abortController) {
		const formData = new FormData();
		formData.append('file', file);
		formData.append('filename', this.filename);
		formData.append('uuid', this.uuid);

		try {
			const response: any = await axios(`${API_SERVER}/airender/assets/upload`, {
				method: 'POST',
				headers: {
					authorization: this.sessionToken,
				},
				data: formData,
				signal: abortController.signal,
			});

			this.updateProgress({
				status: 'finished',
				progress: 100,
				end_time: new Date(),
				duration: this.computeProgressDuration(this.progress.start_time, new Date()),
			});

			return {
				name: response.data.name,

				isFile: true,
				isDirectory: false,
			};
		} catch (error) {
			this.updateProgress({
				status: 'failure',
				progress: 100,
				end_time: new Date(),
				duration: this.computeProgressDuration(this.progress.start_time, new Date()),
			});
		}
	}
	stop() {
		if (this.abortController) {
			this.abortController.abort();
		}
	}
	async restart() {
		this.stop();
		await this.start();
	}
	async updateProgress(state) {
		this.progress = {
			...this.progress,

			...state,
		};
		this.onProgress(this.progress);
	}
	async onProgress(progress) {}
	computeProgressDuration(start_time, end_time) {
		return formatSeconds((end_time.getTime() - start_time.getTime()) / 1000);
	}
}

export { UploadFile, getFileUUID };
