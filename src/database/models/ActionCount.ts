import { Schema, InferSchemaType, HydratedDocument, model } from 'mongoose';

const schema = new Schema({
	bo: { type: String },
	action: { type: String },
	countnum: { type: Number },
});

schema.statics.add = async function (boName, actionName) {
	const tmp = await this.db.models['ActionCount'].findOneAndUpdate(
		{ bo: boName, action: actionName },
		{ $inc: { countnum: 1 } },
		{ upsert: true, new: true }
	);
	return tmp.countnum;
};

schema.statics.get = async function (boName, actionName) {
	const tmp = await this.db.models['ActionCount'].findOne({ bo: boName, action: actionName });
	return tmp?.countnum || -1;
};

export type ActionCountType = HydratedDocument<InferSchemaType<typeof schema>>;
export const ActionCount = model('ActionCount', schema);
