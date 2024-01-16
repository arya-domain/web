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
