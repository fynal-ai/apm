import { HydratedDocument, InferSchemaType, Schema, model } from 'mongoose';

const schema = new Schema(
	{
		key: { type: String, required: [true, '不能为空'], index: true, unique: true },
		scope: {
			type: String,
			required: [true, '不能为空'],
			enum: ['public', 'private', 'AI2NV_OP2'],
			index: false,
		},
		value: { type: Object || Array || String || Number, required: [true, '不能为空'] },
		createdBy: { type: String, required: [true, '不能为空'] },
		updatedBy: { type: String, required: [true, '不能为空'] },
		createdAt: { type: Date, default: Date.now },
		updatedAt: { type: Date, default: Date.now },
	},

	{ timestamps: true }
);

export type AiConfigType = HydratedDocument<InferSchemaType<typeof schema>>;
export const AiConfig = model('AiConfig', schema);
