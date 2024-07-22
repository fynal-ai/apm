import { Mongoose, dbConnect } from "../../database/mongodb.js";
import { Site, SiteType } from "../../database/models/Site.js";

dbConnect().then(async () => {
	console.log("Db connected");
	try {
		let aSite = Site.findOne({ siteid: "000" });
		if (!aSite) {
			let tmp = new Site({
				name: "WorkGPT",
				siteid: "000",
				owner: "admin@company_domain.com",
				mode: "PUBLIC",
				password: "RANDOM",
				users: [],
				ksadmindomain: "@company_domain.com",
				ksconfig: '{"senarios": ["AB"], "industires": ["CD"]}',
				ksenabled: false,
			});
			await tmp.save();
		}
	} catch (err) {
		console.log(err.message);
	} finally {
		await Mongoose.connection.close();
	}
});
