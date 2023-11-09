
const MUZZLE_FLASH_COLOR = [2, 2, 1];
const HIT_FLASH_COLOR    = [2, 2, 1];
const BULLET_COLOR       = [200, 200, 100];


const BULLET_ENUM     = 2100;
const PLAYER_BULLET   = 0;
const GUARD_BULLET    = 1;
const ATTACKER_BULLET = 2;
const REE_BULLET      = 3;

const IMG_BULLET = 0;
const MAX_BULLETS = 100;



function enum_is_bullet( e )
{
    return BULLET_ENUM + PLAYER_BULLET <= e && e <= BULLET_ENUM + REE_BULLET;
}


class BulletSystem
{
    bodies   = [  ];
    types    = [  ];
    visible  = [  ];

    current = 0;
    active  = 0;

    lightsource;
    lightsource2;

    sounds = [  ];
    bullet_colors = [  ];
    hit_colors    = [  ];


    preload( engine )
    {
        this.sounds[PLAYER_BULLET]   = loadSound("game/assets/weapon.mp3");
        this.sounds[ATTACKER_BULLET] = loadSound("game/assets/pistol.wav");
        this.sounds[REE_BULLET]      = loadSound("game/assets/weapon.mp3");
        this.sounds[PLAYER_BULLET].loop   = false;
        this.sounds[ATTACKER_BULLET].loop = false;
        this.sounds[REE_BULLET].loop      = false;

        this.bullet_colors[PLAYER_BULLET]   = [200, 200, 0];
        this.bullet_colors[GUARD_BULLET]    = [200, 200, 0];
        this.bullet_colors[ATTACKER_BULLET] = [125, 255, 255];
        this.bullet_colors[REE_BULLET]      = [255, 155, 155];

        this.hit_colors[PLAYER_BULLET]   = [1, 1, 0.5];
        this.hit_colors[GUARD_BULLET]    = [1, 1, 0.5];
        this.hit_colors[ATTACKER_BULLET] = [0.5, 1, 1];
        this.hit_colors[REE_BULLET]      = [1, 0.5, 0.5];
    };


    setup( engine )
    {
        for (let i=0; i<MAX_BULLETS; i++)
        {
            this.bodies.push(new PhysicsBody(0, 0, 8, 8, "bullet"));
            this.types.push(PLAYER_BULLET);
        }

        const lightSys = engine.getSystem("light");
        this.lightsource = lightSys.getPointlight(2);
        this.lightsource2 = lightSys.getPointlight(1);

    };


    draw( engine )
    {
        this.lightsource.position = [-1000, -1000];
        this.lightsource2.position = [-1000, -1000];

        if (this.active == 0)
        {
            return;
        }

        const render = engine.getSystem("render");
        const terrain = engine.getSystem("terrain");
        const player = engine.getSystem("player");
        const agentSys = engine.getSystem("agent");
        const physics = engine.getSystem("physics");


        strokeWeight(4)

        for (let i=0; i<MAX_BULLETS; i++)
        {
            if (this.visible[i] == false)
            {
                continue;
            }
            const bullet_type = this.types[i];

            const pos  = this.bodies[i].position;
            const lpos = this.bodies[i].last_position;
            const vel  = this.bodies[i].velocity;
            const vmag = this.bodies[i].velocity_mag;

            this.bodies[i].update();

            stroke(this.bullet_colors[bullet_type]);
            line(...render.world_to_screen(...pos), ...render.world_to_screen(...lpos));


            const dir = vec2_normalize(vel);
            const intersection = terrain.nearest_intersection(...pos, ...dir);
            const ix = intersection[0];
            const iy = intersection[1];
            const blocktype = intersection[4];


            physics.grid.addBody(...pos, this.bodies[i]);

            this.bodies[i].resolution = (other) => {

                if (enum_is_bullet(other.label) == false)
                {
                    this.lightsource.position = other.position;
                    this.lightsource.diffuse  = this.hit_colors[bullet_type];

                    this.bodies[i].velocity = [0, 0];
                    this.bodies[i].position = [-1000, -1000];
                    this.visible[i] = false;
                    this.active -= 1;
                }
            };


            if (dist(...pos, ix, iy) <= deltaTime*vmag)
            {
                this.lightsource.position = [ix - 16*Math.sign(vel[0]), iy - 16*Math.sign(vel[1])];
                this.lightsource.diffuse  = this.hit_colors[bullet_type];

                this.bodies[i].velocity = [0, 0];
                this.bodies[i].position = [-1000, -1000];
                this.visible[i] = false;
                this.active -= 1;

                dowith_probability(blocktype_hardness(blocktype), () => {
                    terrain.placeSphere(ix, iy, BLOCK_AIR, 1, 16);
                });
            }
        }

        strokeWeight(1)
    };


    createBullet( x, y, dx, dy, spread=0.0, type=PLAYER_BULLET )
    {
        const terrain = engine.getSystem("terrain");

        this.lightsource2.position   = [x, y];
        this.lightsource2.diffuse    = MUZZLE_FLASH_COLOR;
        this.lightsource2.s_constant = 1000;
        this.lightsource2.radius     = QUADTREE_SPAN;

        let tangent = vec2_tangent([dx, dy]);
        let r = basicallyNormalDistribution(4);
        tangent = vec2_mult(tangent, r*spread);
        let dir = vec2_add([dx, dy], tangent);

        const idx = this.current;

        this.bodies[idx].position[0] = x;
        this.bodies[idx].position[1] = y;
        this.bodies[idx].velocity[0] = 4*dir[0];
        this.bodies[idx].velocity[1] = 4*dir[1];
        this.bodies[idx].hasDrag = false;
        this.bodies[idx].label = BULLET_ENUM + type;

        this.types[idx] = type;
        this.visible[idx] = true;
        this.active += 1;

        this.current = (this.current + 1) % MAX_BULLETS;

        this.sounds[type].play();
    };


    createBullet_startEnd( startx, starty, endx, endy, spread=0.0, type=PLAYER_BULLET)
    {
        const dir = vec2_dir([endx, endy], [startx, starty]);
        this.createBullet(startx, starty, ...dir, spread, type);
    };

};