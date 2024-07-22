import { getAiRenderSoftware } from '$lib/aiconfig/getConfig';

class Software {
	config: any = {
		'3ds Max': {
			ext: ['.max'],
			ver: {
				'2022': {
					renderer: {
						vray: ['6.20.03'],
					},
				},
				'2024': {
					renderer: {
						vray: ['6.20.03'],
						corona: ['11'],
					},
				},
			},
		},
		Maya: {
			ext: ['.ma', '.mb'],
			ver: {
				'2018': {
					renderer: {
						vray: ['5.20.01'],
						redshift: ['3.0.45'],
					},
					plugin: {
						Shave: ['8.0'],
						Yeti: ['1.0'],
					},
				},
				'2024': {
					renderer: {
						vray: ['6.20.03'],
					},
					plugin: {},
				},
			},
		},
		'Cinema 4D': {
			ext: ['.c4d'],
			ver: {
				'2024': {
					renderer: {
						vray: ['6.20.00'],
					},
					plugin: {},
				},
				R19: {
					renderer: {
						vray: ['3.4'],
					},
				},
			},
		},
		Houdini: {
			ext: ['.hip', '.hipnc', '.hiplc'],
		},
	};
	constructor() {}
	async updateConfig() {
		const config = await getAiRenderSoftware();
		if (config) {
			this.config = config;
		}
	}
	getCGNames() {
		return Object.keys(this.config);
	}
	getCGVersions(cgName) {
		const results: any = [];

		{
			const versions = this.config[cgName].ver;
			if (versions) {
				results.push(Object.keys(versions));
			}
		}

		return results.flat();
	}
	getCGPlugins(cg_name, cg_version) {
		const results: any = [];

		if (!cg_version) {
			return results;
		}

		{
			const plugins = this.config[cg_name]?.ver[cg_version]?.plugin;
			if (plugins) {
				results.push(Object.keys(plugins));
			}
		}
		{
			const renderers = this.config[cg_name]?.ver[cg_version]?.renderer;
			if (renderers) {
				results.push(Object.keys(renderers));
			}
		}

		return results.flat();
	}
	getCGPluginsVersions(cg_name, cg_version, plugin_name) {
		const results: any = [];

		if (!cg_version) {
			return results;
		}
		if (!plugin_name) {
			return results;
		}

		// console.log(cg_name, cg_version, plugin_name);

		{
			const plugins = this.config[cg_name]?.ver[cg_version]?.plugin;
			if (plugins) {
				results.push(plugins[plugin_name]);
			}
		}
		{
			const renderers = this.config[cg_name]?.ver[cg_version]?.renderer;
			if (renderers) {
				results.push(renderers[plugin_name]);
			}
		}

		return results.flat();
	}
	getCGExtensions(cgName) {
		const extensions = this.config[cgName].ext;
		if (extensions) {
			return extensions;
		}
	}
	getAllExtensions() {
		const extensions: any = [];
		for (const cgName in this.config) {
			const e = this.getCGExtensions(cgName);
			if (e) {
				extensions.push(e);
			}
		}
		return extensions.flat();
	}
	getCGNameByExtension(extension) {
		if (extension.startsWith('.') === false) {
			extension = '.' + extension;
		}
		for (const cgName in this.config) {
			const extensions = this.config[cgName].ext;
			if (extensions && extensions.includes(extension)) {
				return cgName;
			}
		}
	}
	getCGNameByFileName(fileName) {
		const fileNameArr = fileName.split('.');
		if (fileNameArr.length > 1) {
			const extension = fileNameArr[fileNameArr.length - 1];
			return this.getCGNameByExtension(extension);
		}
	}
	isFileNameSupported(fileName) {
		const extension = fileName.split('.').pop(); // c4d
		return this.getCGNameByExtension(extension) ? true : false;
	}
	isHoudiniFile(fileName) {
		const extension = fileName.split('.').pop(); // hip, hipnc, hiplc
		return extension.startsWith('hip') ? true : false;
	}
}

export { Software };
