const Mutex = {
	mutexes: {},
	lock: {},
	cleanup: null,

	getMutex: function (objkey) {
		if (this.mutexes[objkey]) return this.mutexes[objkey];
		else {
			this.mutexes[objkey] = [];
			return this.mutexes[objkey];
		}
	},
	putObject: function (objkey, obj) {
		this.getMutex(objkey).push(obj);
	},
	process: async function (mykey, func) {
		let that = this;
		//如果不存在myKey的lock，就执行
		if (!that.lock[mykey]) {
			//每次处理，都将lock设定为当前时间
			console.log("Mutext start ", mykey);
			that.lock[mykey] = new Date().getTime();
			let objArr = that.mutexes[mykey];
			//取得对象的序列，拿出第一个进行处理
			let oneObj = objArr.shift();
			/*
			if (oneObj) {
				try {
					await func(oneObj);
				} catch (err) {
					console.error(err);
				}
			}
			//每个处理完成，就删除lock
			delete that.lock[mykey];
			console.log("Mutext end ", mykey);
			*/
			if (oneObj) {
				func(oneObj).then(() => {
					delete that.lock[mykey];
					console.log("Mutext end ", mykey, "func called");
				});
			} else {
				delete that.lock[mykey];
				console.log("Mutext end ", mykey, "obj not found");
			}
		} else {
			//否则，100毫秒后再尝试
			setTimeout(async () => {
				await that.process(mykey, func);
			}, 100);
		}

		if (that.cleanup !== null) {
			clearTimeout(that.cleanup);
		}
		that.cleanup = setTimeout(async () => {
			let keys = Object.keys(that.lock);
			for (let i = 0; i < keys.length; i++) {
				let lockTime = that.lock[keys[i]];
				if (lockTime < new Date().getTime() - 600000) {
					// 10 minutes， 每个对象的处理，不能超过10分钟
					delete that.lock[keys[i]];
				}
			}
			that.cleanup = null;
		}, 1000);
	},
};

export default Mutex;
