import axios from "../libs/axios.lib";

export const register = async (
  body = { email: "", password: "", firstName: "", lastName: "" }
) => {
  const { data } = await axios.post(`/user/register`, body);
  return data;
};

export const login = async (body = { email: "", password: "" }) => {
  const { data } = await axios.post(`/user/login`, body);
  return data;
};
