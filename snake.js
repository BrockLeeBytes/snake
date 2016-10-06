// Allows .last() to get last element of an array
if (!Array.prototype.last){
    Array.prototype.last = function(){
        return this[this.length - 1];
    };
}

// Generates a random integer between the min and the max
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

// Returns true if two coordinates are the same.
function coordinateMatch(coor1, coor2) {
	let coordinate1 = [coor1[0], coor1[1]].join();
	let coordinate2 = [coor2[0], coor2[1]].join();
	if (coordinate1 === coordinate2){
		return true;
	}else {
		return false;
	}
}

var grid = {
	columns:40,
	rows: 40,

	render: function() {
		for (let i = this.rows -1; i >= 0; i--) {
			$('#container').append('<div id="' + i + '"></div>');
			$('#'+ i).addClass('row');
		}

		for (let i = 0; i < this.columns; i++) {
			$('.row').append('<div class="square column' + i + '"></div>');
		}
	}
};

var snake = {
	
	// renders snake based on current section coordinates
	render: function() {
		for (let section of this.sections) {
			let sectionHTMLLocation = $('#' + section[0] + ' .column' + section[1]);
			if (snake.deadSnake()) {
				sectionHTMLLocation.addClass('dead');
			} else {
				sectionHTMLLocation.addClass('snake');
			}
		}
	},

	// Add sections to end of snake
	addSections: function() {
		let sections = this.sections;
		let tail = sections.last();
		for (let i = 0; i < 3; i++) {
			sections.push(tail.slice());
			let current = sections.last();
			switch (current[2]) {
				case 'r':
					current[1] -= (i + 1);
					break;
				case 'l':
					current[1] += (i + 1);
					break;
				case 'u':
					current[0] -= (i + 1);
					break;
				case 'd':
					current[0] += (i + 1);
					break;
			}
		}
	},

	// Changes direction of the head
	changeDirection: function(newDirection) {
		snake.currentDirection = newDirection;
	},

	// Updates the location of a section of the snake
	updateLocation: function(section, direction) {
		section[2] = direction;
		switch (direction) {
			case 'r':
				section[1] += 1;
				break;
			case 'l':
				section[1] -= 1;
				break;
			case 'u':
				section[0] += 1;
				break;
			case 'd':
				section[0] -= 1;
				break;
		}
	},

	updateSnake: function() {
		let head = this.head;
		let sections = this.sections;
		let size = sections.length;
		snake.updateLocation(head, this.currentDirection);
		for (let i = size - 1; i > 0; i--) {
			sections[i] = sections[i - 1].slice();
		}
		sections[0] = head.slice();
		
	},

	// Removes the last segment of the snake on each turn
	removeTrail: function() {
		let trail = this.sections.last();
		$('#' + trail[0] + ' .column' + trail[1]).removeClass('snake');
	},

	// Returns true if snake has collided with self
	selfCollision: function() {
		let head = this.head;
		let sections = this.sections;
		let size = sections.length;
		if (size > 1) {
			for (let i = 1; i < size; i++) {
				if (coordinateMatch(head, sections[i])) {
					return true;
				} 
			}
		} else {
			return false;	
			}
	},

	// Returns true if snake is dead through collision with self or boundries
	deadSnake: function() {
		let head = this.head;
		if (	(head[0] < 0 || head[0] > 39) || (head[1] < 0 || head[1] > 39)	) {
			return true;
		} else {
			return snake.selfCollision();
		}
	},

	eatFood: function() {
		let head = this.head;
		let location = food.location
		if (coordinateMatch(head, location)) {
			$('#' + location[0] + ' .column' + location[1]).removeClass('food');
			snake.addSections();
			food.setLocation();
			food.render();
			food.updateScore();
		}
	}

};

var food = {

	// Recursively sets food location until notValidLocation returns false.
	setLocation: function(){
		food.location = [getRandomInt(0, 40), getRandomInt(0, 40)];
		if (food.notValidLocation()) {
			food.setLocation();
		}
	},

	// Returns true if food location is set in a currently occupied space.
	notValidLocation: function() {
		let sections = snake.sections;
		for( let i = 0; i < sections.length; i ++) {
			if (coordinateMatch(sections[i], food.location)) {
				return true;
			}
		}
		return false;
	},

	updateScore: function() {
		food.score += 10;
		$('#score').text('Score: ' + food.score);
	},

	render: function() {
		let location = food.location;
		$('#' + location[0] + ' .column' + location[1]).addClass('food');
	}
};



var game = {
	over: false,
	// Starts the game loop
	start: function() {
		game.intervalID = setInterval(game.update, 100);
	},
	// Ends the game loop
	finish: function() {
		clearInterval(game.intervalID);
		game.over = true;
		$('#container').prepend('<div id="message"></div>');
		$('#message').text(game.setMessage());
		document.addEventListener('keydown', game.begin);
	},

	// Updates the state of all game objects once per loop
	update: function() {
		snake.removeTrail();
		snake.updateSnake();
		snake.render();
		snake.eatFood();
		if (snake.deadSnake()) {
			game.finish();
		}
	},

	//Clears board
	reset: function() {
		$('.dead').removeClass('dead snake');
		$('.food').removeClass('food');
	},

	// Sets default values for beginning the game
	setup: function() {
		food.score = 0;
		snake.head = [22,22, 'r'];
		snake.sections = [[22,22, 'r']];
		snake.currentDirection = 'r';
		game.over = false;
		food.setLocation();
		food.render();
		snake.render();
	},

	setMessage: function(){
		if(!game.over) {
			return "Welcome to Snake! Use the arrow keys to change direction. Press 'Enter' to begin.";
		} else {
			return "You lost with a score of " + food.score + ". Press 'Enter' to play again.";
		}
	}
};


$(document).ready(function(){
	game.begin = function(e) {
		if (e.which === 13) {
			game.over = false;
			$('#message').remove();
			game.reset();
			game.setup();
			game.start();
			document.removeEventListener('keydown', game.begin)
		};
	};

	grid.render();
	$('#message').text(game.setMessage());
	
	
	document.onkeydown = function(e) {
    switch (true) {
        case e.keyCode === 37 && snake.head[2] !== 'r':
            snake.changeDirection('l');
            break;
        case e.keyCode === 38 && snake.head[2] !== 'd':
            snake.changeDirection('u');
            break;
        case e.keyCode === 39 && snake.head[2] !== 'l':
            snake.changeDirection('r');
            break;
        case e.keyCode === 40 && snake.head[2] !== 'u':
            snake.changeDirection('d');
            break;
    }
	};
	document.addEventListener('keydown', game.begin);
	
})