import { HydratedDocument, InferSchemaType, Schema, model } from 'mongoose';

//Same fields as Parse.com
const schema = new Schema(
	{
		runId: { type: String },
		runMode: { type: String, enum: ['sync', 'async'] },
		name: { type: String },
		version: { type: String },
		input: { type: Object },
		output: { type: Object },
		status: { type: Object },
		remoteRunId: { type: String }, // run remote agent
	},

	{ timestamps: true }
);

export type APMAgentServiceRunType = HydratedDocument<InferSchemaType<typeof schema>>;
export const APMAgentServiceRun = model('APMAgentServiceRun', schema);
