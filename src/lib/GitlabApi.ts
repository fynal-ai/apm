import axios from "axios";
const base_url = `http://localhost:8080/api`;

const Api = axios.create({
    baseURL: base_url,
    headers: {
        "Content-Type": "application/json;charset=utf-8",
    },
    withCredentials: true, // 跨域请求时是否需要使用凭证
    timeout: 30000, // 请求超时时间
});

// 错误处理函数
function errorHandle(response) {
    switch (response.status) {
        case 400:
            break;
        default:
            return Promise.reject(response)
    }
}
// 成功处理函数

function successHandle(response) {
    return response.data
}

Api.interceptors.response.use(
    (response) => {
        return successHandle(response);
    },
    (err) => {
        return errorHandle(err);
    }
);

export default Api;