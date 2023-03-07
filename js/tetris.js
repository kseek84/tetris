import { ManagerGame } from "./managerGame.js";

function draw() {
	ManagerGame.getInstance().update();
	ManagerGame.getInstance().draw();
}

ManagerGame.getInstance().start(document);
setInterval(draw, 20);
