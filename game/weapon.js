
class Weapon
{
    cooldown;
    spread;
    bullet_type;
    ammo_cost = 1;
    sound;
    hair_trigger = false;
    timer  = 0;
    recoil = 0;
    shake  = 0;

    constructor( cooldown, spread, bullet_type )
    {
        this.cooldown    = cooldown;
        this.spread      = spread;
        this.bullet_type = bullet_type;
    }

    pew( x, y, dx, dy )
    {
        if (this.timer > this.cooldown)
        {
            this.timer = 0.0;
            const bulletSys = engine.getSystem("bullet");
            bulletSys.createBullet(x, y, dx, dy, this.spread, this.bullet_type);
            return true;
        }

        return false;
    };
};


const RIFLE_COOLDOWN      = 500;
const RIFLE_SPREAD        = 0.2;
const RIFLE_BULLET_LENGTH = 64;
const RIFLE_RECOIL        = 150;
const RIFLE_SHAKE         = 50;
const RIFLE_AMMO_COST     = 1;

class Rifle extends Weapon
{
    constructor( bullet_type )
    {
        super(RIFLE_COOLDOWN, RIFLE_SPREAD, bullet_type);
        this.recoil    = RIFLE_RECOIL;
        this.ammo_cost = RIFLE_AMMO_COST;
        this.shake     = RIFLE_SHAKE;
    }

    pew( x, y, dx, dy )
    {
        if (this.timer >= this.cooldown)
        {
            this.timer = 0.0;
            const bulletSys = engine.getSystem("bullet");
            bulletSys.createBullet(
                x, y, dx, dy,
                this.spread, this.bullet_type,
                RIFLE_BULLET_LENGTH
            );
            this.sound.play();
            return true;
        }

        return false;
    };
};



const SHOTGUN_COOLDOWN      = 1500;
const SHOTGUN_SPREAD        = 0.25;
const SHOTGUN_NUM_BULLETS   = 8;
const SHOTGUN_AMMO_COST     = SHOTGUN_NUM_BULLETS;
const SHOTGUN_BULLET_LENGTH = 8;
const SHOTGUN_RECOIL        = 600;
const SHOTGUN_SHAKE         = 1200;

class Shotgun extends Weapon
{
    constructor( bullet_type )
    {
        super(SHOTGUN_COOLDOWN, SHOTGUN_SPREAD, bullet_type);
        this.recoil    = SHOTGUN_RECOIL;
        this.ammo_cost = SHOTGUN_AMMO_COST;
        this.shake     = SHOTGUN_SHAKE;
    };

    pew( x, y, dx, dy )
    {
        if (this.timer > this.cooldown)
        {
            this.timer = 0.0;
            const bulletSys = engine.getSystem("bullet");

            for (let i=0; i<SHOTGUN_NUM_BULLETS; i++)
            {
                bulletSys.createBullet(
                    x, y, dx, dy,
                    this.spread, this.bullet_type,
                    SHOTGUN_BULLET_LENGTH,
                    random(0.8, 1.2)
                );
            }
            this.sound.play();

            return true;
        }

        return false;
    };
};

