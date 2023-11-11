

function type_is_bullet( t )
{
    return t == FRIENDLY_BULLET || t == UNFRIENDLY_BULLET || t == PLAYER_BULLET;
}


let __slow_bullets      = false;
let __bullet_speed_mult = 2.0;


class BulletSystem
{
    bodies   = [  ];
    lengths  = [  ];
    types    = [  ];
    visible  = [  ];

    current = 0;
    active  = 0;

    lightsource;
    muzzle_flash;

    bullet_colors = [  ];
    hit_colors    = [  ];


    preload( engine )
    {
        this.bullet_colors[PLAYER_BULLET]     = [255, 255, 200];
        this.bullet_colors[FRIENDLY_BULLET]   = [255, 255, 200];
        this.bullet_colors[UNFRIENDLY_BULLET] = [255, 255, 200];

        this.hit_colors[PLAYER_BULLET]     = [0.5, 0.5, 0.25];
        this.hit_colors[FRIENDLY_BULLET]   = [0.5, 0.5, 0.25];
        this.hit_colors[UNFRIENDLY_BULLET] = [0.5, 0.5, 0.25];
    };


    setup( engine )
    {
        for (let i=0; i<MAX_BULLETS; i++)
        {
            this.bodies.push(new PhysicsBody(-1000, -1000, 8, 8, "bullet"));

            this.bodies[i].body_resolution = (other) => {

                if (this.bodies[i].label == FRIENDLY_BULLET && other.label == PLAYER_AGENT)
                {
                    return;
                }

                if (type_is_bullet(other.label) == false)
                {
                    this.destroyBullet(i, ...other.position);
                }
            };

            this.bodies[i].terrain_resolution = (ix, iy, nx, ny, distSQ, blocktype) => {
            
                const x = ix - 16*Math.sign(this.bodies[i].velocity[0]);
                const y = iy - 16*Math.sign(this.bodies[i].velocity[1]);
                this.destroyBullet(i, x, y);

                dowith_probability(blocktype_softness(blocktype), () => {
                    engine.getSystem("terrain").placeSphere(ix, iy, BLOCK_AIR, 1, 16);
                });
            };

            this.types.push(FRIENDLY_BULLET);
        }

        const lightSys = engine.getSystem("light");
        this.lightsource = lightSys.getPointlight(2);
        this.lightsource.radius = QUADTREE_SPAN;
        this.muzzle_flash = lightSys.getPointlight(1);

    };


    draw( engine )
    {
        if (__slow_bullets == true)
        {
            __bullet_speed_mult = 0.5;
        }

        else
        {
            __bullet_speed_mult = 2.0;
        }

        const render  = engine.getSystem("render");

        this.lightsource.position  = [-1000, -1000];
        this.muzzle_flash.position = [-1000, -1000];
        this.lightsource.diffuse   = [0, 0, 0];
        this.muzzle_flash.diffuse  = [0, 0, 0];

        if (this.active == 0)
        {
            return;
        }

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
            const vdir = this.bodies[i].velocity_dir;

            stroke(this.bullet_colors[bullet_type]);
            line(
                ...render.world_to_screen(...pos),
                ...render.world_to_screen(...vec2_sub(pos, vec2_mult(vdir, this.lengths[i])))
            );
        }

        strokeWeight(1)
        stroke(0);
    };


    createBullet( x, y, dx, dy, spread=0.0, type, length=1, speed=1 )
    {
        const light = this.muzzle_flash;

        light.position   = [x, y];
        light.diffuse    = MUZZLE_FLASH_COLOR;
        light.s_quadratic = 5;
        light.radius     = QUADTREE_SPAN;

        let tangent = vec2_tangent([dx, dy]);
        let r = abnormalDist(4);
        tangent = vec2_mult(tangent, r*spread);
        let dir = vec2_add([dx, dy], tangent);

        const idx = this.current;

        this.bodies[idx].last_position[0] = x;
        this.bodies[idx].last_position[1] = y;
        this.bodies[idx].position[0] = x;
        this.bodies[idx].position[1] = y;
        this.bodies[idx].velocity[0] = __bullet_speed_mult * speed*dir[0];
        this.bodies[idx].velocity[1] = __bullet_speed_mult * speed*dir[1];
        this.bodies[idx].hasDrag = false;
        this.bodies[idx].label = type;

        this.lengths[idx] = length;

        this.types[idx] = type;
        this.visible[idx] = true;
        this.active += 1;

        this.current = (this.current + 1) % MAX_BULLETS;
    };


    createBullet_startEnd( startx, starty, endx, endy, spread=0.0, type)
    {
        const dir = vec2_dir([endx, endy], [startx, starty]);
        this.createBullet(startx, starty, ...dir, spread, type);
    };


    destroyBullet( id, x, y )
    {
        const bullet_type = this.types[id];

        const light = this.lightsource;

        light.position[0] = x;
        light.position[1] = y;
        light.diffuse = this.hit_colors[bullet_type];

        // light.constant    = 1.0;
        // light.linear      = 1.0;
        light.s_quadratic   = 10;

        // light.s_constant  = 1.0;
        // light.s_linear    = 5.0;
        // light.s_quadratic = 5.0;
        // light.s_radius    = 8.0;

    
        this.bodies[id].velocity = [0, 0];
        this.bodies[id].position = [-1000, -1000 - 100*id];
        this.visible[id] = false;
        this.active -= 1;
    };


    addBodies()
    {
        const physics = engine.getSystem("physics");
    
        for (let i=0; i<MAX_BULLETS; i++)
        {
            if (this.visible[i] == false)
            {
                continue;
            }
        
            physics.grid.addBody(this.bodies[i]);
        }
    };

};