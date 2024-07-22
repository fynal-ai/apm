import Joi from 'joi';

type ValidationEntry = {
	schema: Joi.Schema;
	error?: Joi.ValidationError;
};
type ValidationObject = {
	[key: string]: ValidationEntry;
};
export type { ValidationEntry, ValidationObject };

const validate = (validation: ValidationObject, object: any): ValidationObject => {
	for (const key in validation) {
		validation[key].error = validation[key].schema.validate(object[key]).error;
	}
	return validation;
};

const isValid = (validation: ValidationObject): boolean => {
	return Object.values(validation).every((v) => v.error === undefined);
};

export { Joi, validate, isValid };
