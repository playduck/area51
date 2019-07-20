/* jshint esversion: 6 */

class projectile    {
    constructor(_pos, _vector, _damage, _player) {
        this.pos = {x: _pos.x, y: _pos.y};
        this.vec = _vector;
        this.damage = _damage;
        this.player = _player;
        this.radius = 25;
        this.hit = false;
    }

    show()  {
        fill("black");
        circle(this.pos.x, this.pos.y, this.radius, this.radius);
    }

    update()    {
        this.pos.x += this.vec.x/15;
        this.pos.y += this.vec.y/15;

        if (this.pos.x < this.player.pos.x + this.player.dim.width &&
            this.pos.x + this.radius > this.player.pos.x &&
            this.pos.y < this.player.pos.y + this.player.dim.height-40 &&
            this.pos.y + this.radius > this.player.pos.y+40 && !this.hit)    {
                this.hit = true;
                this.player.damage(this.damage);

        }
    }

    isOff() {
        return (this.pos.x <= 0 || this.pos.y <= 0) || (this.pos.x >= 1024 || this.pos.y >= 1024) || this.hit;
    }
}