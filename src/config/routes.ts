'use strict';
import AccountRoutes from '../routes/account/endpoints.js';
import APMRoutes from '../routes/apm/endpoints.js';
const Routes = {
	//Concatentate the routes into one array
	//set the routes for the server
	init: async function (server: any) {
		let allRoutes = [].concat(
			// 只展示登录和登出接口，其他接口不展示
			AccountRoutes.endpoints.map((e) => {
				if (
					[
						// '/account/login',
						// '/account/logout',
						// '/account/register'
					].includes(e.path)
				) {
					return e;
				}

				return {
					...e,

					config: {
						...e.config,

						tags: [],
					},
				};
			}),
			APMRoutes.endpoints
		);
		await server.route(allRoutes);
	},
};

export default Routes;
