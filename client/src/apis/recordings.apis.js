import axios from "../libs/axios.lib";
import * as secureStorage from "../utils/storage.utils";

export const saveRecording = async (fd) => {
	const { token } = secureStorage.getUser();
	return;

	// const urlecoded = new URLSearchParams(fd).toString();

	// await axios.post("/recordings/video", fd, {
	// 	headers: {
	// 		// "Content-Type": "application/x-www-form-urlencoded",
	// 		"Content-Type": "multipart/form-data",
	// 		Authorization: "Bearer " + token,
	// 	},
	// });
};

export const saveAudioRecording = async (fd) => {
	const { token } = secureStorage.getUser();

	return;

	// const urlecoded = new URLSearchParams(fd).toString();

	// const { data } = await axios.post("/recordings/audio", fd, {
	// 	headers: {
	// 		// "Content-Type": "application/x-www-form-urlencoded",
	// 		"Content-Type": "multipart/form-data",
	// 		Authorization: "Bearer " + token,
	// 	},
	// });

	// return data;
};
