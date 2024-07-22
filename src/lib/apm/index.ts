import Joi from 'joi';

const PAGING_PAYLOAD = {
	pagingMark: Joi.date().description('The paging mark'),
	hastotal: Joi.boolean().description('Whether to include the total number'),
	extrajson: Joi.object().description('Extra parameters, json format mongodb query conditions'),
	skip: Joi.number().description('Skip the number'),
	limit: Joi.number().description('Return the number').default(20),
	sortBy: Joi.object().description('Sort by').default({ updatedAt: -1 }),
};

export { PAGING_PAYLOAD };
