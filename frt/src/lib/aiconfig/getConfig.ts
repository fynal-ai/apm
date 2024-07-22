import { Joi } from '$lib/Joi';
import * as api from '$lib/api';

const validation = {
	'baystone.homepage.statistics': Joi.array().required().description('首页统计'),

	'baystone.airesource.gpuModel': Joi.array().items(Joi.string()).required().description('GPU型号'),
	'baystone.airesource.expertContact': Joi.object().required().description('算力专家联系'),

	'airender.software': Joi.object().required().description('软件'),
};

async function getConfig(key: string) {
	let config;

	{
		const { value } = await api.post('/aiconfig/public/get', {
			key,
		});

		if (value && validation[key] && validation[key].validate(value).error === undefined) {
			config = value;
		}
	}

	return config;
}

async function getHomepageStatistics() {
	return await getConfig('baystone.homepage.statistics');
}

async function getGpuModel() {
	return await getConfig('baystone.airesource.gpuModel');
}

async function getAiResourceExpertContact() {
	return await getConfig('baystone.airesource.expertContact');
}

async function getAiRenderSoftware() {
	return await getConfig('airender.software');
}

export {
	getAiRenderSoftware,
	getAiResourceExpertContact,
	getConfig,
	getGpuModel,
	getHomepageStatistics,
};
