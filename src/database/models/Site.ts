'use strict';
import { Schema, InferSchemaType, model, HydratedDocument } from 'mongoose';

const schema = new Schema(
	{
		name: { type: String, required: true },
		siteid: { type: String, required: true, index: true, unique: true },
		admins: [String],
		mode: { type: String, required: true },
		password: { type: String, required: true },
		users: [String],
		ksenabled: { type: Boolean, required: true, default: false },
		ksadmindomain: { type: String, default: '' },
		ksconfig: { type: String, default: '' },
		ksig: { type: String, default: '{}' },
	},
	{ versionKey: false }
);
export type SiteType = HydratedDocument<InferSchemaType<typeof schema>>;
export const Site = model('Site', schema);
