


class Weapon
{
    cooldown;
    spread;
    bullet_type;

    constructor( cooldown, spread, bullet_type=PLAYER_BULLET )
    {
        this.cooldown = cooldown;
        this.spread   = spread
        this.bullet_type = bullet_type;
    }

    pew( x, y, dx, dy )
    {
        const bulletSys = engine.getSystem("bullet");
        bulletSys.createBullet(x, y, dx, dy, this.spread, this.bullet_type);
    };

};


class PewPew extends Weapon
{

};



