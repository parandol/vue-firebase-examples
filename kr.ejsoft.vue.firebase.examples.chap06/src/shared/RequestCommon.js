// import axios from 'axios'
const axios = require('axios');

export const RequestCommon = class RequestCommon {
	static get(url, params, headers) {
		return this.ajax("get", url, params, headers);
	}

	static post(url, params, headers) {
		return this.ajax("post", url, params, headers);
	}

	static ajax(method, url, params, headers) {
		return new Promise(function(resolve, reject) {

			// this.vue.$http.defaults.headers.common['Origin'] = "http://192.168.1.85:9999";
			// this.vue.$http.defaults.headers.common['Content-Type'] = "text/plain";
			// delete this.vue.$http.defaults.headers.common['Authorization'];
			// delete this.vue.$http.defaults.headers.common['AuthorizationKey'];
			// axios({

			let data = params;
			if(method === "post") {
				// let formData = new FormData();
				// for(const _key in params) {
				//	 const _value = params[_key];
				//	 formData.set(_key, _value);
				// }
				// data = formData;
				// console.log("formData", formData);

				const querystring = require('querystring');
				data =  querystring.stringify(params);
			}
			// this.vue.$http({
			axios({
				method : method,
				url : url,
				params : (method !== "post" ? data : null),
				data: (method === "post" ? data : null),
				// headers: {
				// 	// 'Authorization': null,
				// 	// 'AuthorizationKey': null,
				// 	// 'Access-Control-Request-Headers': null
				// },
				headers: headers,
				withCredentials: true
			})
			// this.vue.$http.post(url, formData)
			// this.vue.$http.post(url, params)
			.then(function (response) {
				// console.log(response);
				if(typeof response === "string") {
					resolve(response);
					return;
				}
				if (response.status === 200 && response.data) {
					// console.log(response.data);

					// const data = response.data;
					// const { code, message } = data;
					// if(code === "1000") {
					//	 _this.saveToken(data, _callback);
					// } else if(code === "2001" || code === "2002") {
					//	 _callback(true, code, "", data);
					// } else {
					//	 _callback(false, code, message);
					// }
					resolve(response.data);
				} else {
					resolve(response);
				}
			}
			, function (err) {
				// console.log('err', err)
				// _callback(false, "", err);
				reject(err);
			})
		});
	}
};