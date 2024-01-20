import axios from "../libs/axios.lib";
import * as secureStorage from "../utils/storage.utils";

export const saveResponse = async (
	body = { questionId: 0, selectedOptionId: 0 }
) => {
	return;
	// const { token } = secureStorage.getUser();
	// await axios.post(`/responses`, body, {
	// 	headers: {
	// 		Authorization: "Bearer " + token,
	// 	},
	// });
};

export const saveAudioRecAPI = async (fd) => {
	const { token } = secureStorage.getUser();
	await axios.post(`/user/user-responses/audio`, fd, {
		headers: {
			Authorization: "Bearer " + token,
		},
	});
};

export const saveVideoRecAPI = async (fd) => {
	const { token } = secureStorage.getUser();
	await axios.post(`/user/user-responses/video`, fd, {
		headers: {
			Authorization: "Bearer " + token,
		},
	});
};

export const processResponseAPI = async (quizId) => {
	const { token } = secureStorage.getUser();
	const { data } = await axios.post(
		`/api/processing`,
		{ quiz_id: quizId },
		{
			headers: {
				Authorization: "Bearer " + token,
			},
		}
	);

	return data;
};
