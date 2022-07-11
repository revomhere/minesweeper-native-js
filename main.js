"use strict";

let rows; // count of rows (field)
let cols; // count of cols (field)

let mines; // count of mines (field)
let closed; // count of closed cells (field)

let field; // actually field array
let cells; // array with cells (HTML Collection)

// class of one cell of field
class Cell {
	constructor(mine = false, flag = false, open = false, around = 0) {
		this.mine = mine;
		this.flag = flag;
		this.open = open;
		this.around = around;
	}
}

// function of initialization field
function init(rowsNew, colsNew, minesNew) {
	field = [];
	rows = rowsNew;
	cols = colsNew;
	mines = minesNew;
	closed = rows * cols;
	for (let i = 0; i < rows; i++) {
		const newRow = [];
		field.push(newRow);
		for (let j = 0; j < cols; j++) {
			const cell = new Cell();
			field[i][j] = cell;
		}
	}
	const minesArr = [];
	for (let i = 0; i < rows * cols; i++) {
		minesArr.push(i < mines);
	}
	shuffleArray(minesArr);
	for (let i = 0; i < rows; i++)
		for (let j = 0; j < cols; j++) {
			field[i][j].mine = minesArr[i * cols + j];
			if (field[i][j].mine)
				for (let di = -1; di < 2; di++)
					for (let dj = -1; dj < 2; dj++)
						if (isCellInMap(di + i, dj + j))
							field[di + i][dj + j].around++;
		}
}

// function called to start new game or restart old one
function startGame(
	countOfRows = rows,
	countOfCols = cols,
	countOfMines = mines
) {
	// body background color
	document.querySelector("body").style.backgroundColor = "#000";

	// initialize field
	init(countOfRows, countOfCols, countOfMines);

	const saper = document.querySelector("#saper");
	const help = document.createElement("div");

	const sizeItem = window.innerHeight * 0.75;
	const cellSize = sizeItem / rows;

	help.setAttribute("id", "help");

	// help styles
	help.style.fontSize = sizeItem / 24 + "px";
	help.style.bottom = -sizeItem / 8 + "px";
	help.style.padding = sizeItem / 90 + "px";

	// clearing and setting a help text to screen
	saper.innerHTML = "";
	saper.append(help);

	// adding a help text
	help.innerHTML = `You have to open&nbsp;<span id="countOfMines">${
		closed - mines
	}</span>&nbsp;closed cells to win!`;
	document.querySelector("#countOfMines").style.textShadow =
		sizeItem / 3000 +
		"px " +
		sizeItem / 3000 +
		"px " +
		sizeItem / 100 +
		"px red";

	// adding a field in HTML
	for (let i = 0; i < rows; i++) {
		// creating row
		const row = document.createElement("div");
		row.className = "row";

		// inserting row into HTML
		saper.append(row);

		// loop for filling the row
		for (let j = 0; j < cols; j++) {
			// creating cell div-element with class 'cell'
			const cell = document.createElement("div");
			cell.className = "cell closed";

			// styles
			cell.style.border = sizeItem / 3000 + "px solid #000";
			cell.style.height = cell.style.width = cellSize + "px";
			cell.style.fontSize = sizeItem / 12 + "px";

			// lmb click event listener
			cell.addEventListener("click", () => openCell(i, j));

			// rmb click event listener
			cell.addEventListener("contextmenu", (e) => {
				e.preventDefault();
				switchFlag(i, j);
			});

			// actually inserting cell into HTML
			row.append(cell);
		}
	}

	// filling an cells array (with cells as HTML elements)
	const cellsTemp = document.querySelectorAll(".cell");
	cells = [];

	// conversion of a 1-dimensional array into a 2-dimensional one
	for (let i = 0; i < rows; i++) {
		const row = [];
		cells.push(row);
		for (let j = 0; j < cols; j++) cells[i][j] = cellsTemp[i * cols + j];
	}
}

/* ---- ingame functions ---- */
function openCell(x, y) {
	// if cell is opened or has flag we can't open it
	if (field[x][y].open || field[x][y].flag) return;

	// else
	// cell which we will open
	const cell = cells[x][y];

	// minus 1 of closed cells and set cell in status "opened"
	closed--;
	field[x][y].open = true;
	cell.classList.add("opened");
	cell.classList.remove("closed");

	// check for losing the game
	if (field[x][y].mine) {
		loseGame(x, y);
		return;
	}

	// drawing count of mines around
	if (field[x][y].around > 0) cell.innerText = field[x][y].around;
	// else opening every cell around
	else
		for (let dx = -1; dx < 2; dx++)
			for (let dy = -1; dy < 2; dy++)
				if (isCellInMap(dx + x, dy + y))
					openCell(dx + x, dy + y);

	// check for winning the game
	if (closed == mines) {
		winGame();
		return;
	}

	// new count of cells without mines in help text
	document.querySelector("#countOfMines").innerText = closed - mines;
}

// function of switching a flag (if cell has flag - delete it, else - add)
function switchFlag(x, y) {
	// if cell is opened - we can't switch flag
	if (field[x][y].open) return;

	// if cell has flag
	if (field[x][y].flag) {
		field[x][y].flag = false;
		cells[x][y].innerHTML = "";
		return;
	}

	// if cell doesn't have a flag
	field[x][y].flag = true;

	// creating an flag element
	const flag = document.createElement("img");
	flag.src = "imgs/flag.png";
	flag.classList.add("flag");

	// insterting flag element into HTML
	cells[x][y].append(flag);
}

// function called when player click on a mine
function loseGame(x, y) {
	// checking every cell on field
	for (let i = 0; i < rows; i++) {
		for (let j = 0; j < cols; j++) {
			const cell = cells[i][j];

			// if cell has flag => clear it
			if (field[i][j].flag) {
				field[i][j].flag = false;
				cell.innerHTML = "";
			}

			// if cell is closed now => set class 'openedAfterLosing' and remove 'closed'
			if (!field[i][j].open) {
				field[i][j].open = true;
				cell.classList.remove("closed");
				cell.classList.add("openedAfterLosing");

				// if cell is closed and has around-value not equal to zero and here is no mine => show around-value
				if (field[i][j].around > 0 && !field[i][j].mine)
					cell.innerText = field[i][j].around;
			}

			// if cell has mine => draw mine
			if (field[i][j].mine) {
				// creating an mine element in HTML
				const mine = document.createElement("img");
				mine.src = "imgs/mine.png";
				mine.classList.add("mine");

				// inserting the mine
				cell.append(mine);
			}
		}
	}

	// help text "YOU LOST"
	document.querySelector("#help").innerText = "YOU LOST";
}

// function called when player win the game
function winGame() {
	// checking every cell on field
	for (let i = 0; i < rows; i++) {
		for (let j = 0; j < cols; j++) {
			const cell = cells[i][j];

			// the only condition is mine. if cell is closed (the only closed cells are mine cells) then delete class 'closed' and add 'openedAfterWinning',
			// clear it's HTML and draw mine
			if (field[i][j].mine) {
				field[i][j].open = true;
				cell.classList.remove("closed");
				cell.classList.add("openedAfterWinning");

				// creating an mine element in HTML
				const mine = document.createElement("img");
				mine.src = "imgs/mine.png";
				mine.classList.add("mine");

				// inserting the mine
				cell.innerHTML = "";
				cell.append(mine);
			}
		}
	}

	// help text "YOU WON"
	document.querySelector("#help").innerText = "YOU WON";
}

/* ----- SERVICE FUNCTIONS ----- */

// check if cell is in field
function isCellInMap(x, y) {
	return x >= 0 && y >= 0 && x < rows && y < cols;
}

// shuffle array function (taken from internet)
function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
}

startGame(8, 12, 10);
