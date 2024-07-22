import { _axios_tx } from "../../config/axios.js";

export const getOpenId = (data) => {
  console.log(
    `/sns/oauth2/access_token?appid=${data?.appid}&secret=${data?.secret}&code=${data?.js_code}&grant_type=authorization_code`,
  );
  return _axios_tx.get(
    `/sns/oauth2/access_token?appid=${data?.appid}&secret=${data?.secret}&code=${data?.js_code}&grant_type=authorization_code`,
  );
};
