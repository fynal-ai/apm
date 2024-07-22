'use strict';
import { HydratedDocument, InferSchemaType, Schema, model } from 'mongoose';
interface ITimestamp {
	_id: Schema.Types.ObjectId | string;
	createdAt: Date;
	updatedAt: Date;
}

const schema = new Schema(
	{
		site: String,
		owner: { type: String, trim: true, lowercase: true, required: true, uniuqe: true },
		name: { type: String, required: true },
		hasemail: { type: Boolean, default: false },
		domain: { type: String, default: '', unique: true },

		css: { type: String, trim: true, lowercase: true, required: false, default: '' },
		logo: { type: String, trim: true, lowercase: true },
		login_background: { type: String, trim: true, lowercase: true },
		page_background: { type: String, trim: true, lowercase: true },
		orgmode: { type: Boolean, default: false },
		regfree: { type: Boolean, default: false },
		allowemptypbo: { type: Boolean, default: true },
		timezone: { type: String, default: 'GMT' },
		openaiapikey: { type: String, default: 'no_key' },
		menu: { type: String, default: 'Home;Docs:Template;Workflow;Team' },
		smtp: {
			type: {
				from: { type: String, required: true },
				host: { type: String, required: true },
				port: { type: Number, required: true },
				secure: { type: Boolean, required: true },
				username: { type: String, required: true },
				password: { type: String, required: true },
			},
			required: false,
		},
		tags: { type: String, required: false, default: '' },
	},
	{ timestamps: true }
);
schema.index({ site: 1, name: 1 }, { unique: true });

export type TenantType = HydratedDocument<InferSchemaType<typeof schema>> & ITimestamp;
export const Tenant = model('Tenant', schema);
