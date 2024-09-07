import { HydratedDocument, InferSchemaType, Schema, model } from 'mongoose';

//Same fields as Parse.com
const schema = new Schema(
	{
		author: { type: String },
		version: { type: String },
		name: { type: String },
		label: { type: String },
		description: { type: String },
		icon: { type: String },
		doc: { type: String },
		config: {
			input: { type: Object },
			output: { type: Object },
		},
		executor: { type: String },
		apikey_provider: { type: String, default: 'me' },
		executorConfig: { type: Object },
		md5: { type: String },
		runMode: { type: String, enum: ['sync', 'async'] },
		endpoints: { type: Object }, // remote agent server
		isPublic: { type: Boolean, default: true },
	},

	{ timestamps: true }
);

export type APMAgentType = HydratedDocument<InferSchemaType<typeof schema>>;
export const APMAgent = model('APMAgent', schema);
