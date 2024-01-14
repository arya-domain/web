import { useEffect, useRef, useCallback } from "react";
import axios from "axios";

let interval;

const useVideoRecorder = () => {
	const videoRef = useRef(null);
	const canvasRef = useRef(null);

	const startVideoRec = useCallback(() => {
		navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
			videoRef.current.srcObject = stream;
			videoRef.current.play();
		});

		interval = setInterval(async () => {
			if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
				const canvas = canvasRef.current;
				const context = canvas.getContext("2d");
				context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
				let dataUrl = canvas.toDataURL("image/jpeg", 1.0);
				let response = await axios.post("/api/detect", {
					image: dataUrl,
				});
				let modifiedImage = response.data.image;
				let img = new Image();
				img.onload = () =>
					context.drawImage(img, 0, 0, canvas.width, canvas.height);
				img.src = modifiedImage;
			}
		}, 300);
	}, []);

	const stopVideoRec = useCallback(() => {
		videoRef.current?.srcObject?.getVideoTracks?.()?.[0]?.stop();
		clearInterval(interval);
	}, []);

	useEffect(() => {
		return () => clearInterval(interval);
	}, []);

	return {
		videoRef,
		canvasRef,
		stopVideoRec,
		startVideoRec,
	};
};

export default useVideoRecorder;
