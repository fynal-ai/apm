import Crypto from "../../lib/Crypto.js";
import { Mongoose, dbConnect } from "../../database/mongodb.js";
import { User } from "../../database/models/User.js";
import { Tenant } from "../../database/models/Tenant.js";

if (process.argv.length < 6) process.exit(0);
console.log("Create Tenant:");
const tenant_name = process.argv[2];
const admin_email = process.argv[3];
const admin_name = process.argv[4];
const admin_passwd = process.argv[5];
console.log("Tenant name:", tenant_name);
console.log("Admin email:", admin_email);
console.log("Admin name:", admin_name);
console.log("Admin passwd:", admin_passwd);
if (!tenant_name || !admin_email || !admin_name || !admin_passwd) process.exit(0);

dbConnect().then(async () => {
	console.log("Db connected");
	try {
		let tenant = await Tenant.findOne({ name: tenant_name });
		if (!tenant) {
			tenant = new Tenant({
				orgmode: true,
				timezone: "CIT",
				site: "000",
				name: tenant_name,
				owner: admin_email,
				css: "",
				smtp: {
					from: "mtc@companya.com ",
					host: "smtp.companya.com",
					port: 465,
					secure: true,
					username: "SMTP_USER",
					password: "SMTP_PASSWORD",
				},
				menu: "Home;Docs;Tempalte;Workflow",
				tags: "IT;Finance;Admin;HR",
				orgchartadminpds: "",
				regfree: true,
			});
			tenant = await tenant.save();
			console.log("Tenant Created");
		}
		let user = await User.findOne({ email: admin_email });
		if (!user) {
			user = new User({
				emailVerified: true,
				group: "ADMIN",
				site: "000",
				username: admin_name,
				tenant: tenant._id,
				password: Crypto.encrypt(admin_passwd),
				email: admin_email,
				avatar: "/avatar/default.png",
				ps: 30,
				ew: { email: true, wecom: true },
				signature: "",
				avatarinfo: {},
				active: true,
				succeed: "",
				relogin: false,
			});
			user = await user.save();
			console.log("User Created");
		}
	} catch (err) {
		console.log(err.message);
	} finally {
		await Mongoose.connection.close();
	}
});
