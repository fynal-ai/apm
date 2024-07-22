"use strict";
import Mongoose from "mongoose";

const schema = new Mongoose.Schema({
	tenant_id: { type: String, required: true },
	account: { type: String, required: true },
	user_name: { type: String, required: true },
	status: { type: Number, required: true, default: 0 }, //0、待审批 1、已通过 2、未通过
});

export default Mongoose.model("JoinApplication", schema);
