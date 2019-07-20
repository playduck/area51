/* jshint esversion: 6 */

const data = {
    0: {
        max_health: 300,
        speed: 500,
        armor: 200,
        special: null
    },
    enemy: {
        max_health: 200,
        speed: 100,
        armor: 0
    }
};

class entity {
    constructor(_type, _player)   {
        this.type = _type;
        this.player = _player;
        this.drawn = false;

        this.dim = {
            width: 120,
            height: 200
        };

        this.pos = {
            x: 0,
            y: 0,
            dir: false
        };
        this.state = "idle";
        this.frame = 0;

        this.images = {
            idle: [null],
            running: [null],
            hurt: [null],
            punch: [null],
            shooting: [null],
            special: [null],
            death: [null]
        };

        this.max_health = data[this.type].max_health;
        this.health = this.max_health;
        this.speed = data[this.type].speed;
        this.armor = data[this.type].armor;

        this.timeout = false;
        this.projectiles = [];
    }

    nextFrame() {
        this.frame = (this.frame + 1) % this.images[this.state].length;
    }

    show()  {
        this.drawn = true;
        this.nextFrame();
        push();
        if(this.pos.dir)    {
            scale(-1, 1);
            translate(-this.images[this.state][this.frame].width, 0);
        }
        
        if(this.type == "enemy")    {
            if(this.state == "death")   {
                fill("black");
            }   else if(this.state == "hurt") {
                fill("blue");
            } else {
                fill("red");
            }
        }   else    {
            fill("white");
        }
        rect(this.pos.x, this.pos.y, this.dim.width, this.dim.height);
        //image(this.images[this.state][this.frame], this.pos.x, this.pos.y);
        pop();
    }

    setPos(x,y) {
        x = Math.round( Math.min(Math.abs(x), 1024 - this.dim.width) );
        // y += 200;
        y = Math.round( Math.max(570, Math.min(1024-this.dim.height, y)) );
        this.pos.x = x;
        this.pos.y = y;
    }

    getPos()    {
        return this.pos;
    }

    move(ud, lr)   {        
        if(ud == 1)    {
            this.setPos(this.pos.x, this.pos.y - this.speed/15);
        }   else if(ud == -1)   {
            this.setPos(this.pos.x, this.pos.y + this.speed/15);
        }
        if(lr == 1) {
            this.setPos(this.pos.x - this.speed/15, this.pos.y);
        }   else if(lr == -1)   {
            this.setPos(this.pos.x + this.speed/15, this.pos.y);
        }
    }

    update()    {
        if(this.type == "enemy")    {

            this.projectiles.forEach( (p, i) => {
                if(p.isOff())   {
                    this.projectiles.splice(i,1);
                }
                p.show();
                p.update();
            });

            if(this.health <= 0)    {
                this.state = "death";
            }

            if(this.state == "hurt" || this.state == "death") {
                this.drawn = false;
                return;
            }

            let p_pos = this.player.getPos();
            let dx = p_pos.x - this.pos.x + 50 * Math.random();
            let dy = p_pos.y - this.pos.y + 50 * Math.random();

            if(this.state == "shooting")    {
                if(this.timeout == false)   {
                    this.timeout = true;
                    setTimeout(() => {this.timeout = false;}, 4000);
                    this.projectiles.push(new projectile({x: this.pos.x + this.dim.width/2, y: this.pos.y + this.dim.height/2}, {x: dx,y: dy}, 50, this.player));
                    this.state = "idle";
                    this.drawn = false;
                    return;
                }
            }

            this.state = "running";
            let s = simplify(dx, dy);
            if(Math.abs(dx) + Math.abs(dy) > 260)   {
                this.setPos(this.pos.x + (this.speed/15 * s[0]), this.pos.y + (this.speed/15 * s[1]));
            }   else if(Math.abs(dx) + Math.abs(dy) < 200)   {
                this.setPos(this.pos.x + (this.speed/20 * -s[0]), this.pos.y + (this.speed/20 * -s[1]));
            }   else    {
                this.state = "shooting";
            }
        }   else    {
            if(this.health <= 0)    {
                this.state = "death";
            }

            if(this.state == "death") {
                console.log("death");
                reset();
                this.drawn = false;
                return;
            }



        }
        this.drawn = false;
    }

    damage(amount)  {
        if(this.state != "death")   {
            this.health -= amount * map_range(this.armor, 0, 500, 1, 0.4);
            this.state = "hurt";
            setTimeout( () => {this.state = "idle"; }, 600 );

            if(this.player === null)    {
                console.log(this.health);
            }
        }
    }

}

function simplify(dx, dy)   {
    if(Math.abs(dx) > Math.abs(dy)) {
        return [sign(dx), 0];
    }   else    {
        return [0, sign(dy)];
    }
}

function sign(x) {
    return typeof x === 'number' ? x ? x < 0 ? -1 : 1 : x === x ? 0 : NaN : NaN;
}

function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}