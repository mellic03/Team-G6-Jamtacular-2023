
const WEAPON_RIFLE   = 0;
const WEAPON_SHOTGUN = 1;

class WeaponSystem
{
    sounds       = [  ];
    constructors = [  ];
    weapons      = [  ];
    active       = [  ];
    idx          = 0;

    preload( engine )
    {
        this.sounds[WEAPON_RIFLE]   = loadSound("game/assets/weapon.mp3");
        this.sounds[WEAPON_SHOTGUN] = loadSound("game/assets/shotgun.mp3");

        this.sounds[WEAPON_RIFLE].loop   = false;
        this.sounds[WEAPON_SHOTGUN].loop = false;

        this.constructors = [
            Rifle,
            Shotgun
        ];

    };


    setup( engine )
    {

    };


    draw( engine )
    {
        for (let weapon of this.weapons)
        {
            weapon.timer += deltaTime;

            if (engine.getSystem("keylog").mouseUp() && weapon.hair_trigger)
            {
                weapon.timer = weapon.cooldown;
            }
        }
    };


    createWeapon( weapon_type, bullet_type )
    {
        const weapon = new this.constructors[weapon_type](bullet_type);
        weapon.sound = this.sounds[weapon_type];
        this.weapons[this.idx] = weapon;
        this.active[this.idx]  = true;

        this.idx = (this.idx + 1);

        return weapon;
    };
};




