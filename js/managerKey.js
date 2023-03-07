import { ManagerBlock } from "./managerBlock.js";

export class ManagerKey {
	static instance = new ManagerKey();
	static getInstance() {
		return ManagerKey.instance;
	}

	start() {
		this.mbi = ManagerBlock.getInstance();
		this.btnList = {
			btnUp: false,
			btnLeft: false,
			btnDown: false,
			btnRight: false,
			btnSpace: false,
		};

		document.addEventListener("keydown", (e) => {
			if (!this.mbi.RUN) return;
			const k = e.code;
			if (k == "KeyW" || k == "ArrowUp") {
				this.mbi.rotate();
			} else if (k == "KeyA" || k == "ArrowLeft") {
				this.mbi.left();
			} else if (k == "KeyS" || k == "ArrowDown") {
				this.mbi.down();
			} else if (k == "KeyD" || k == "ArrowRight") {
				this.mbi.right();
			} else if (k == "Space") {
				while (this.mbi.down()) {}
			}
			this.mbi.draw();
			if (
				k == "ArrowUp" ||
				k == "ArrowLeft" ||
				k == "ArrowDown" ||
				k == "ArrowRight" ||
				k == "Space"
			) {
				e.preventDefault();
			}
		});

		let isClickEasy = true;
		this.mbi.$btnEasy.addEventListener("click", (e) => {
			if (isClickEasy) {
				this.mbi.$btnEasy.innerHTML = "Normal";
				this.mbi.borderDraw();
			} else {
				this.mbi.$btnEasy.innerHTML = "Easy";
				this.mbi.borderRemove();
				this.mbi.removeGuide();
			}
			isClickEasy = !isClickEasy;
			this.mbi.EASY = !this.mbi.EASY;
			this.mbi.$btnEasy.blur();
		});

		let isClickPause = true;
		this.mbi.$btnPause.addEventListener("click", (e) => {
			if (isClickPause) {
				this.mbi.$btnPause.innerHTML = "Resume";
			} else {
				this.mbi.$btnPause.innerHTML = "Pause";
			}
			isClickPause = !isClickPause;
			this.mbi.RUN = !this.mbi.RUN;
			this.mbi.$btnPause.blur();
		});

		this.mbi.$btnSpeedChange.addEventListener("click", (e) => {
			const speed = Number(
				prompt("speed (1~11)", this.mbi.$speed.innerHTML)
			);
			if (isNaN(speed)) return;
			if (!(0 < speed && speed < 12)) return;
			this.mbi.$speed.innerHTML = speed;
			this.mbi.timer_game_delay = 50 - (speed - 1) * 5;
		});

		this.mbi.$btnSpeedDown.addEventListener("click", (e) => {
			this.mbi.speedDown();
		});

		this.mbi.$btnSpeedUp.addEventListener("click", (e) => {
			this.mbi.speedUp();
		});

		for (let i = 0; i < this.mbi.$buttons.length; i++) {
			this.mbi.$buttons[i].addEventListener("mousedown", (e) => {
				if (!this.mbi.RUN) return;
				e.target.blur();

				const btnName = e.target.id;

				if (btnName == "btnUp") {
					this.mbi.rotate();
				} else if (btnName == "btnLeft") {
					this.mbi.left();
				} else if (btnName == "btnDown") {
					this.mbi.down();
				} else if (btnName == "btnRight") {
					this.mbi.right();
				} else if (btnName == "btnSpace") {
					while (this.mbi.down()) {}
				}

				this.mbi.draw();

				this.btnList[btnName] = true;
				this.mbi.btnClick = true;
				this.mbi.timer_click = 0;
			});
			this.mbi.$buttons[i].addEventListener("mouseup", (e) => {
				if (!this.mbi.RUN) return;
				e.target.blur();
				const btnName = e.target.id;
				this.btnList[btnName] = false;
				this.mbi.btnClick = false;
			});
		}
	}
}
