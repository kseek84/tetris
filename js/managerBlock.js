import { ManagerKey } from "./managerKey.js";
import { NodeBlock } from "./nodeBlock.js";

export class ManagerBlock {
	static instance = new ManagerBlock();
	static getInstance() {
		return ManagerBlock.instance;
	}

	start(doc) {
		this.$tetris = doc.querySelector("#tetris");
		this.$nextBlock = doc.querySelector("#nextBlock");
		this.$btnEasy = doc.querySelector("#btnEasy");
		this.$btnPause = doc.querySelector("#btnPause");
		this.$btnSpeedDown = doc.querySelector("#btnSpeedDown");
		this.$btnSpeedUp = doc.querySelector("#btnSpeedUp");
		this.$btnSpeedChange = doc.querySelector("#btnSpeedChange");
		this.$score = doc.querySelector("#score");
		this.$speed = doc.querySelector("#speed");
		this.$time = doc.querySelector("#time");
		this.$buttons = doc.querySelectorAll("button");
		this.btnClick = false;
		this.blockList = [];
		this.dataList = [];
		this.guideBlock = [];
		this.curBlock = null;
		this.nextBlock = null;
		this.curY = 1;
		this.curX = 4;
		this.score = 0;
		this.colorList = "w,r,o,y,g,b,n,v,,guide,dg,black".split(",");
		this.EMPTY = 0;
		this.BORDER = 10;
		this.DEAD = 11;
		this.RUN = true;
		this.EASY = false;
		this.speed = 1;
		this.time = 0;
		this.timer = 0;
		this.timer_game = 0;
		this.timer_game_delay = 50;
		this.timer_click = 0;

		this.$time.innerHTML = 0;
		this.$score.innerHTML = 0;
		this.$speed.innerHTML = 1;

		const sampleBlockList = this.getSample();
		for (let i in sampleBlockList) {
			let sample = sampleBlockList[i];
			let block = new NodeBlock(sample.name, sample.color, sample.shape);
			this.blockList.push(block);
		}

		// 게임 테이블(front), 데이터(back) 셋팅
		for (let y = 0; y < 22; y++) {
			let $tr = document.createElement("tr");
			this.$tetris.append($tr);
			this.dataList.push(new Array(12).fill(this.EMPTY));
			for (var x = 0; x < 12; x++) {
				let $td = document.createElement("td");
				$tr.append($td);
			}
		}

		// 테두리 - 가로 2
		this.dataList[0] = new Array(12).fill(this.BORDER);
		this.dataList[21] = new Array(12).fill(this.BORDER);
		for (let i = 0; i < 12; i++) {
			this.setTable(0, i, this.BORDER);
			this.setTable(21, i, this.BORDER);
		}

		// 테두리 - 세로 2
		for (let i = 1; i < 21; i++) {
			this.dataList[i][0] = this.BORDER;
			this.dataList[i][11] = this.BORDER;
			this.setTable(i, 0, this.BORDER);
			this.setTable(i, 11, this.BORDER);
		}

		// 다음 블럭 테이블
		for (let y = 0; y < 4; y++) {
			let $tr = document.createElement("tr");
			this.$nextBlock.append($tr);
			for (let x = 0; x < 4; x++) {
				let $td = document.createElement("td");
				$tr.append($td);
			}
		}

		this.makeBlock();
	}

	btnListen() {
		const btnList = ManagerKey.getInstance().btnList;
		if (btnList.btnUp) {
			this.rotate();
		} else if (btnList.btnLeft) {
			this.left();
		} else if (btnList.btnDown) {
			this.down();
		} else if (btnList.btnRight) {
			this.right();
		} else if (btnList.btnSpace) {
			while (this.down()) {}
		}

		this.draw();
	}

	setTime() {
		let h, m, s, time;
		time = "";
		h = Math.floor(this.time / (60 * 60));
		m = Math.floor((this.time % (60 * 60)) / 60);
		s = Math.floor(this.time % 60);
		if (h) {
			time += h + "h ";
		}
		if (m) {
			time += m + "m ";
		}
		time += s;
		this.$time.innerHTML = time;
	}

	update() {
		if (!this.RUN) return;
		this.timer += 1;
		if (this.timer >= 50) {
			this.timer = 0;
			this.time += 1;
			this.setTime();
		}

		if (this.btnClick) {
			this.timer_click += 1;
			if (this.timer_click >= 10) {
				this.timer_click = 0;
				this.btnListen();
			}
		}

		if (this.timer_game > this.timer_game_delay) {
			this.timer_game = 0;
			this.down();
		}
		this.timer_game += 1;
	}

	lineClear() {
		const del = [];
		for (let y = 1; y < 21; y++) {
			let isFull = true;
			for (let x = 1; x < 11; x++) {
				if (this.dataList[y][x] != this.DEAD) {
					isFull = false;
					break;
				}
			}
			if (isFull) {
				del.push(y);
			}
		}
		this.score += del.length;
		if (del.length && !this.EASY) {
			this.$score.innerHTML = this.score;
			this.speedUp();
		}
		for (let i in del) {
			this.dataList.splice(del[i], 1);
			this.dataList.splice(0, 1);
			this.dataList.unshift(
				[this.BORDER].concat(new Array(10).fill(this.WHITE), [
					this.BORDER,
				])
			);
			this.dataList.unshift(new Array(12).fill(this.BORDER));
		}
	}

	setTable(y, x, color) {
		this.$tetris.children[y].children[x].className = this.colorList[color];
	}

	draw() {
		if (this.EASY) {
			this.drawGuide();
		}
		for (let y = 1; y < 21; y++) {
			for (let x = 1; x < 11; x++) {
				this.setTable(y, x, this.dataList[y][x]);
			}
		}
	}

	removeGuide() {
		let block, y, x;
		for (let i in this.guideBlock) {
			block = this.guideBlock[i];
			y = block[0];
			x = block[1];
			if (this.dataList[y][x] == 9) {
				this.dataList[y][x] = this.EMPTY;
			}
		}
	}

	drawGuide() {
		this.removeGuide();
		let block, y, x;
		const realBlock = this.getRealBlock(this.curBlock.shape);
		let nY = 1;
		while (this.getCanMove(realBlock, nY, 0)) {
			nY += 1;
		}
		nY -= 1;
		this.guideBlock = [];
		for (let i in realBlock) {
			block = realBlock[i];
			y = block[0];
			x = block[1];
			if (this.dataList[nY + y][x] == this.EMPTY) {
				this.dataList[nY + y][x] = 9;
				this.guideBlock.push([nY + y, x]);
			}
		}
	}

	getRotate(shape) {
		const new_shape = [];
		for (let y = 0; y < shape.length; y++) {
			new_shape.push(new Array(shape.length).fill(0));
		}
		for (let y = 0; y < shape.length; y++) {
			for (let x = 0; x < shape.length; x++) {
				new_shape[shape.length - 1 - x][y] = shape[y][x];
			}
		}
		return new_shape;
	}

	rotate() {
		const curShape = this.curBlock.shape;
		const nextShape = this.getRotate(curShape);
		const curRealBlock = this.getRealBlock(curShape);
		const nextRealBlock = this.getRealBlock(nextShape);
		const canChange = this.getCanMove(nextRealBlock, 0, 0);
		if (canChange) {
			// 현재 블록 위치 지우기
			this.setData(curRealBlock, 0, 0, this.EMPTY);
			// 다음 블록 색칠
			this.setData(nextRealBlock, 0, 0, this.curBlock.color);
			this.curBlock.shape = nextShape; // 변경
		}
		return canChange;
	}

	left() {
		return this.moveBlock(0, -1);
	}
	right() {
		return this.moveBlock(0, 1);
	}
	down() {
		const canDown = this.moveBlock(1, 0);
		if (!canDown && this.curY == 1) {
			this.RUN = false;
			this.setData(
				this.getRealBlock(this.curBlock.shape),
				0,
				0,
				this.DEAD
			);
			return canDown;
		}
		if (!canDown) {
			this.setData(
				this.getRealBlock(this.curBlock.shape),
				0,
				0,
				this.DEAD
			);
			this.lineClear();
			this.makeBlock();
		}
		return canDown;
	}
	moveBlock(y, x) {
		const realBlock = this.getRealBlock(this.curBlock.shape);
		const canMove = this.getCanMove(realBlock, y, x);
		if (canMove) {
			// 현재 블록 위치 비우기
			this.setData(realBlock, 0, 0, this.EMPTY);
			// 다음 블록 위치 색칠
			this.setData(realBlock, y, x, this.curBlock.color);
			this.curY += y;
			this.curX += x;
		}
		return canMove;
	}

	setData(realBlock, ny, nx, color) {
		let block, y, x;
		for (let i in realBlock) {
			block = realBlock[i];
			y = block[0];
			x = block[1];
			this.dataList[y + ny][x + nx] = color;
		}
	}

	getRealBlock(shape) {
		const realBlock = [];
		for (let y = 0; y < shape.length; y++) {
			for (let x = 0; x < shape.length; x++) {
				if (shape[y][x] == 1) {
					realBlock.push([y + this.curY, x + this.curX]);
				}
			}
		}
		return realBlock;
	}

	getCanMove(realBlock, ny, nx) {
		let block, y, x;
		for (let i in realBlock) {
			block = realBlock[i];
			y = block[0];
			x = block[1];
			if (this.dataList[y + ny][x + nx] >= this.BORDER) {
				return false;
			}
		}
		return true;
	}

	makeBlock() {
		this.curBlock = this.nextBlock;

		if (!this.curBlock) {
			const r = Math.floor(Math.random() * this.blockList.length);
			this.curBlock = this.blockList[r];
		}

		const r = Math.floor(Math.random() * this.blockList.length);
		this.nextBlock = this.blockList[r];

		// 다음 블록 그리기
		for (let i = 0; i < 4; i++) {
			this.$nextBlock.children[i].children[3].className =
				this.colorList[this.EMPTY];
			this.$nextBlock.children[3].children[i].className =
				this.colorList[this.EMPTY];
		}
		for (let y = 0; y < this.nextBlock.shape.length; y++) {
			for (let x = 0; x < this.nextBlock.shape.length; x++) {
				if (this.nextBlock.shape[y][x] == "1") {
					this.$nextBlock.children[y].children[x].className =
						this.colorList[this.nextBlock.color];
				} else {
					this.$nextBlock.children[y].children[x].className =
						this.colorList[this.EMPTY];
				}
			}
		}

		const shape = this.curBlock.shape;

		this.curX = 4;
		this.curY = 1;

		for (let y = 0; y < shape.length; y++) {
			for (let x = 0; x < shape.length; x++) {
				if (shape[y][x] == "1") {
					this.dataList[this.curY + y][this.curX + x] =
						this.curBlock.color;
				}
			}
		}
	}

	getSample() {
		const blocks = [
			{
				name: "s",
				color: 1,
				shape: ["000", "011", "110"],
			},
			{
				name: "z",
				color: 2,
				shape: ["000", "110", "011"],
			},
			{
				name: "t",
				color: 3,
				shape: ["000", "111", "010"],
			},
			{
				name: "l",
				color: 1,
				shape: ["010", "010", "011"],
			},
			{
				name: "lr",
				color: 5,
				shape: ["010", "010", "110"],
			},
			{
				name: "o",
				color: 6,
				shape: ["000", "011", "011"],
			},
			{
				name: "b",
				color: 7,
				shape: ["0000", "1111", "0000", "0000"],
			},
		];
		return blocks;
	}

	borderDraw() {
		for (let y = 1; y < 21; y++) {
			for (let x = 1; x < 11; x++) {
				this.$tetris.children[y].children[x].style.border =
					"1px solid black";
			}
		}
	}

	borderRemove() {
		for (let y = 1; y < 21; y++) {
			for (let x = 1; x < 11; x++) {
				this.$tetris.children[y].children[x].style.border = "";
			}
		}
	}

	speedDown() {
		this.speed -= 1;
		if (this.speed < 1) {
			this.speed = 1;
		}
		this.timer_game_delay = 50 - (this.speed - 1) * 5;
		this.$speed.innerHTML = this.speed;
	}

	speedUp() {
		this.speed += 1;
		if (this.speed > 11) {
			this.speed = 11;
		}
		this.timer_game_delay = 50 - (this.speed - 1) * 5;
		this.$speed.innerHTML = this.speed;
	}
}
