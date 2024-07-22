/**
 *  用于清理Tenants表，
 *
 *
 **/
import { Mongoose, dbConnect } from "../../database/mongodb.js";
import { User } from "../../database/models/User.js";
import { Tenant } from "../../database/models/Tenant.js";

dbConnect().then(async () => {
	console.log("Db connected");
	let users = await User.find({}, { email: 1, tenant: 1 });
	for (let i = 0; i < users.length; i++) {
		let tenants = await Tenant.find({ owner: users[i].account });
		if (tenants.length > 1) {
			console.log(users[i].account, tenants.length);
			await Tenant.deleteMany({
				_id: { $ne: users[i].tenant },
			});
		}
	}
	await Mongoose.connection.close();
});
