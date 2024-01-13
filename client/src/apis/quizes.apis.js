import axios from "../libs/axios.lib";
import * as secureStorage from "../utils/storage.utils";

export const getQuizes = () =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve([{ id: 1, title: "Steadiness Assessment Questions" }]);
    }, 1000);
  });

export const startQuiz = async (quizId) => {
  const { token } = secureStorage.getUser();

  return;
};
export const endQuiz = async (quizId) => {
  const { token } = secureStorage.getUser();

  return;
};

export const getQuestions = async (url) => {
  const { token } = secureStorage.getUser();

  const { data } = await axios.get("/quiz", {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  return data;
};
