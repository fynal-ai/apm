import { HydratedDocument, InferSchemaType, Schema, model } from 'mongoose';

//Same fields as Parse.com
const schema = new Schema({
	agentName: { type: String, required: true },
	owner: { type: String, required: true },
});
schema.index({ agentName: 1, owner: 1 }, { unique: true });

export type OwnershipType = HydratedDocument<InferSchemaType<typeof schema>>;
export const Ownership = model('Ownership', schema);
