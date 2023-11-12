
const WEAPON_RIFLE   = 0;
const WEAPON_SHOTGUN = 1;

class WeaponSystem
{
    sounds       = [  ];
    play_sound   = [  ];
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

        this.play_sound[WEAPON_RIFLE] = false;
        this.play_sound[WEAPON_SHOTGUN] = false;

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

        for (let i=0; i<this.play_sound.length; i++)
        {
            if (this.play_sound[i] == true)
            {
                this.sounds[i].play();
            }

            this.play_sound[i] = false;
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


    playSound( weapon_type )
    {
        this.play_sound[weapon_type] = true;
    };

};




