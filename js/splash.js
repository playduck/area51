/* jshint esversion: 6 */
// TODO:
// switch to p5.gif.js for animation loops

let current_frames = 0;
let state = "splash";
let running = false;
let timeout = false;

let entities = [];

let selection_frame = 0;
let current_selection = 0;

let assets = {
	splash: {
		letters: [],
	},
	selection: [],
};

function preload()	{
	assets.splash.bg = loadImage('../asset/splash/bg.jpg');
	assets.splash.letters[0] = loadImage('../asset/splash/letters_A.jpg');
	assets.splash.letters[1] = loadImage('../asset/splash/letters_I.jpg');
	assets.splash.letters[2] = loadImage('../asset/splash/letters_D.jpg');
	assets.splash.subtitle = loadImage('../asset/splash/subtitle.jpg');
	assets.splash.start = loadImage('../asset/splash/start.jpg');

	assets.selection.bg = loadImage('../asset/selection/bg.jpg');
	assets.selection[0] = loadImageArray('../asset/selection/Na/Na_', 3);
	assets.selection[1] = loadImageArray('../asset/selection/Av/Av_', 15);
	assets.selection[2] = loadImageArray('../asset/selection/Ky/Ky_', 14);
	assets.selection[3] = loadImageArray('../asset/selection/Fu/Fu_', 15);
	assets.selection[4] = loadImageArray('../asset/selection/We/We_', 9);
}

function setup() {
	const setup = { 
		size : 	Math.min( Math.min( window.innerWidth, window.innerHeight), 1024),
	};
	createCanvas(setup.size, setup.size);
	frameRate(1);
	// debug
	// frameRate(20);
	
	setInterval(() => {
		// console.log(current_frames);
		current_frames = 0;
	}, 1000);
}

function draw()	{
	current_frames++;

	if(!running)	{
		switch(state)	{
			case "splash": 
				image(assets.splash.bg, 0, 0);
				state = "splash_letters_A";
				break;
			case "splash_letters_A":	
				image(assets.splash.letters[0], 388, 28);
				state = "splash_letters_I";
				break;
			case "splash_letters_I":	
				image(assets.splash.letters[1], 564, 28);
				state = "splash_letters_D";
				break;
			case "splash_letters_D":	
				image(assets.splash.letters[2], 644, 28);
				state = "splash_letters_Sub";
				break;
			case "splash_letters_Sub":	
				image(assets.splash.subtitle, 284, 360); 
				state = "splash_blink_off";
				frameRate(2);
				break;
			case "splash_blink_off":
				image(assets.splash.bg, 272, 792, 416, 92, 272, 792, 416, 92);
				state = "splash_blink_on";
				break;
			case "splash_blink_on":
				image(assets.splash.start, 272, 792);
				state = "splash_blink_off";
				break;

			case "loading_fade_in":
				background(52, 31, 36, 50);
				break;

			case "selection_bg":
				image(assets.selection.bg, 0, 0);
				state = "selection"; 
				frameRate(9);
				break;

			case "selection":
				image(assets.selection[current_selection][selection_frame], 0, 0);
				selection_frame = (selection_frame+1) % assets.selection[current_selection].length;
				break;
		}
	}	else	{
		// game logic

		if(keyIsDown(RIGHT_ARROW))	{
			entities[0].move(0, -1);
		}	else if(keyIsDown(LEFT_ARROW))	{
			entities[0].move(0, 1);
		}
		if(keyIsDown(UP_ARROW))	{
			entities[0].move(1, 0);
		}	else if(keyIsDown(DOWN_ARROW))	{
			entities[0].move(-1, 0);
		}

		// draw bg
		image(assets.splash.bg, 0, 0);
		image(assets.splash.letters[0], 388, 28);
		image(assets.splash.letters[1], 564, 28);
		image(assets.splash.letters[2], 644, 28);
		// draw actors & update states
		
		let drawn = 0;
		do {
			let next = undefined;
			let dist = Infinity;
			for(let i = 0; i < entities.length; i++)	{
				if(!entities[i].drawn && entities[i].pos.y < dist)	{
					dist = entities[i].pos.y;
					next = i;
				}
			}
			if(next != undefined)	{
				entities[next].show();
				drawn++;
			}
		} while(drawn != entities.length);

		entities.forEach( (e) => {
			e.update();
		} );

	}
}

function keyPressed() {
	// console.log(keyCode);
	if(!running)	{
		if(state.includes("splash_blink")	)	{		
			splash_start();
		}	else if(keyCode == 39)	{
			current_selection = (current_selection+1) % assets.selection.length;
		}	else if(keyCode == 37)	{
			current_selection = (current_selection-1) < 0 ? assets.selection.length-1 : (current_selection-1);
		}	else if(state == "selection")	{
			game_start();
		}
		selection_frame = 0;
	}	else	{
		if(keyCode == 16)	{
			if(!timeout)	{
				timeout = true;
				setTimeout( () => {
					timeout = false;
				}, 600);

				console.log("punching");

				//find closest to entity[0]
				let closest;
				let distance = Infinity;
				let p_pos = entities[0].getPos();
				for(let i = 1; i < entities.length; i++)	{
					let e_pos = entities[i].getPos();
					let d = Math.abs(p_pos.x - e_pos.x) + Math.abs(p_pos.y - e_pos.y);
					if(d < distance && entities[i].state != "death")	{
						distance = d;
						closest = i;
					}
				}

				if(distance < 200)	{
					entities[closest].damage(60);
				}
			}
		}
	}
}

// function mouseClicked()	{
// 	if(state.includes("splash_")	)	{		
// 		splash_start();
// 	}
// }

// function touchStarted()	{
// 	if(state.includes("splash_")	)	{		
// 		splash_start();
// 	}
// }

function splash_start()	{
	frameRate(30);
	state = "loading_fade_in";
	setTimeout(() => {
		frameRate(2);
		background(52, 31, 36);
		state = "selection_bg";
	}, 600);
}

function loadImageArray(path, amount) {
	let array = [amount];
	for(let i = 0; i < amount; i++)	{
		array[i] = loadImage(path+i.toString()+".jpg");
	}
	return array;
}

function game_start()	{
	console.log("Starting Game with Charachter "+current_selection);
	// alert("Tweet @Jeremiumy to make more art! Proof of Concept.");
	frameRate(30);
	state = "loading_fade_in";
	setTimeout(() => {
		frameRate(9);
		background(52, 31, 36);
		running = true;
		state = "running";
	}, 1000);

	entities[0] = new entity(current_selection, null);
	entities[0].setPos(100, 500);
	for(let i = 1; i < 4; i++)	{
		entities[i] = new entity("enemy", entities[0]);
		entities[i].setPos(1024 - 600 * Math.random(), 500 + 300 * Math.random() );
	}
}

function reset()	{
	running = false;
	frameRate(30);
	state = "loading_fade_in";
	setTimeout( () => {
		background(52, 31, 36, 50);
		frameRate(2);
		state = "splash";
	}, 1000);
}