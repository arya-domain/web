import React, { useContext } from "react";

import DataContext from "../context/dataContext";

const VideoRecorder = () => {
	const { canvasRef, videoRef } = useContext(DataContext);

	return (
		<>
			<video ref={videoRef} style={{ display: "none" }} muted></video>
			<canvas ref={canvasRef} width="500" height="440"></canvas>
		</>
	);
};

export default VideoRecorder;
