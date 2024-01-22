import { useEffect } from "react";

let interval;

const MAX_MINS_MSEC = 1000 * 60 * 1.5; //1.30 min
// const MAX_MINS_MSEC = 1000 * 10;

let timer = MAX_MINS_MSEC;

function getTimerSpanEle(params) {
	return document.getElementById("timer-span");
}

function setTimerSpanEle(msec = 0) {
	const timerSpanEle = getTimerSpanEle();
	timer = msec;
	timerSpanEle.textContent = millisecondsToTime(msec);
}

const useTimer = (stopRecording) => {
	function startTimer(params) {
		clearInterval(interval);
		setTimerSpanEle(MAX_MINS_MSEC);
		interval = setInterval(() => {
			const newTimer = timer - 1000;
			if (newTimer < 0) {
				stopRecording();
				setTimerSpanEle(MAX_MINS_MSEC);
				return;
			}
			setTimerSpanEle(newTimer);
		}, 1000);
	}

	function stopTimer() {
		setTimerSpanEle(0);
		clearInterval(interval);
	}

	useEffect(() => {
		return () => {
			clearInterval(interval);
		};
	}, []);

	return {
		startTimer,
		stopTimer,
	};
};

export default useTimer;

function millisecondsToTime(s) {
	return new Date(s).toISOString().slice(14, -5);
}
