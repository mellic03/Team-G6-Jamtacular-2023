
const MUZZLE_FLASH_COLOR = [2, 2, 1];
const HIT_FLASH_COLOR    = [2, 2, 1];
const BULLET_COLOR       = [200, 200, 100];

const PLAYER_BULLET   = 0;
const GUARD_BULLET    = 1;
const ATTACKER_BULLET = 2;


class PhysicsBody
{
    position;
    velocity;

    last_position;
    velocity_mag;
    velocity_magSq;

    width;
    height;

    hasDrag = true;
    drag    = 0.05;

    constructor( x=0, y=0, w=32, h=32 )
    {
        this.position = [x, y];
        this.velocity = [0, 0];

        this.last_position  = [x, y];
        this.velocity_magSq = 0.0;
        
        this.width  = w;
        this.height = h;
    };


    applyForce( dx, dy, strength=1.0 )
    {
        this.velocity[0] += strength*dx;
        this.velocity[1] += strength*dy;
    };


    applyForceTowards( x, y, strength=1.0 )
    {
        let dir = vec2_dir([x, y], this.position);
        this.applyForce(...dir, strength);
    };


    update()
    {
        const terrain = engine.getSystem("terrain");
        const data = terrain.nearest_intersection(...this.position, ...vec2_normalize(this.velocity));
        
        const x = data[0];
        const y = data[1];

        if (distance2(x, y, ...this.position) <= this.velocity_magSq)
        {
            this.velocity = vec2_mult(this.velocity, -0.8);
        }

        this.last_position[0] = valueof(this.position[0]);
        this.last_position[1] = valueof(this.position[1]);

        this.position[0] += deltaTime * this.velocity[0];
        this.position[1] += deltaTime * this.velocity[1];

        this.velocity_magSq = vec2_magSq(this.velocity);
        this.velocity_mag = sqrt(this.velocity_magSq);

        if (this.hasDrag)
            this.velocity = velocityDampening(this.drag, ...this.velocity);
    };

};


const IMG_BULLET = 0;
const MAX_BULLETS = 100;

class BulletSystem
{
    bodies  = [  ];
    types   = [  ];
    visible = [  ];

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
        this.sounds[PLAYER_BULLET].loop   = false;
        this.sounds[ATTACKER_BULLET].loop = false;

        this.bullet_colors[PLAYER_BULLET]   = [200, 200, 0];
        this.bullet_colors[GUARD_BULLET]    = [200, 200, 0];
        this.bullet_colors[ATTACKER_BULLET] = [125, 255, 255];

        this.hit_colors[PLAYER_BULLET]   = [1, 1, 0.5];
        this.hit_colors[GUARD_BULLET]    = [1, 1, 0.5];
        this.hit_colors[ATTACKER_BULLET] = [0.5, 1, 1];
    };


    setup( engine )
    {
        for (let i=0; i<MAX_BULLETS; i++)
        {
            this.bodies.push(new PhysicsBody(0, 0, 32, 32));
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
        let r = basicallyNormalDistribution(3);
        tangent = vec2_mult(tangent, r*spread);
        let dir = vec2_add([dx, dy], tangent);

        const idx = this.current;

        this.bodies[idx].position[0] = x;
        this.bodies[idx].position[1] = y;
        this.bodies[idx].velocity[0] = 3*dir[0];
        this.bodies[idx].velocity[1] = 3*dir[1];
        this.bodies[idx].hasDrag = false;
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