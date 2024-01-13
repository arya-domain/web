import { useEffect, useState } from "react";
import { useContext } from "react";
import DataContext from "../context/dataContext";

let interval;

const MAX_MINS_MSEC = 1000 * 60 * 1;

let timer = MAX_MINS_MSEC;

function getTimerSpanEle(params) {
	return document.getElementById("timer-span");
}

function setTimerSpanEle(msec = 0) {
	const timerSpanEle = getTimerSpanEle();
	timer = msec;
	timerSpanEle.textContent = millisecondsToTime(msec);
}

const useTimer = () => {
	const { nextQuestion } = useContext(DataContext);

	function resetTimer() {
		setTimerSpanEle(MAX_MINS_MSEC);
	}

	useEffect(() => {
		interval = setInterval(() => {
			const newTimer = timer - 1000;

			if (newTimer < 0) {
				nextQuestion();
				setTimerSpanEle(MAX_MINS_MSEC);
				return;
			}

			setTimerSpanEle(newTimer);
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	}, [nextQuestion]);

	return {
		resetTimer,
		initialTimer: millisecondsToTime(MAX_MINS_MSEC),
	};
};

export default useTimer;

function millisecondsToTime(s) {
	return new Date(s).toISOString().slice(14, -5);
}
