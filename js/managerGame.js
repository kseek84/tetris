import { ManagerBlock } from "./managerBlock.js";
import { ManagerKey } from "./managerKey.js";

export class ManagerGame {
	static instance = new ManagerGame();
	static getInstance() {
		return ManagerGame.instance;
	}

	start(doc) {
		ManagerBlock.getInstance().start(doc);
		ManagerKey.getInstance().start();
	}

	update() {
		ManagerBlock.getInstance().update();
	}

	draw() {
		ManagerBlock.getInstance().draw();
	}

	btnListen() {
		ManagerKey.getInstance().btnListen();
	}
}
