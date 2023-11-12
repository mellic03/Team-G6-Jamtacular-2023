
const SOLDIER_HEALTH  = 100;
const SECURITY_HEALTH = 200;


class Agent
{
    sprite;
    body;
    movespeed = 0.05;
    rotation  = true;

    maxhealth = 100.0;
    health    = this.maxhealth;
    parent = undefined;
    friendly = false;

    selected  = false;
    energy    = 10.0;
    inventory = [ 0, 0, 0, 0 ];

    last_target    = [ NaN, NaN ];
    current_target = [ NaN, NaN ];

    path = [  ];
    reversed_path = [  ];
    path_idx = -1;

    retreating   = false;


    constructor( sprite )
    {
        this.body = new PhysicsBody(random(-150, 150), random(-150, 150), 16, 16, "agent");
        this.body.drag = 0.2;
        this.body.fast_collisions = false;
        this.sprite = sprite;

        this.body.body_resolution = (other) => {

            if (other.label >= PLAYER_BULLET && other.label <= UNFRIENDLY_BULLET)
            {
                this.health -= 10;
                return;
            }


            if (other.label == "PLAYER_FACTORY" || other.label == "ENEMY_FACTORY")
            {
                return;
            }

            const dir     = vec2_dir(other.position, this.body.position);
            const radii   = (this.body.radius + other.radius);
            const dst     = dist(...this.body.position, ...other.position);
            const overlap = radii - dst;
    
            this.body.position[0] -= (overlap/8) * dir[0];
            this.body.position[1] -= (overlap/8) * dir[1];
        };
    };


    reset( sprite, parent )
    {
        this.body.drag = 0.2;
        this.sprite = sprite;
        this.parent = parent;
        this.last_target = [valueof(parent.position[0]), valueof(parent.position[1])];
        this.health = valueof(this.maxhealth);

        this.subreset();
    };


    subreset()
    {

    };


    isFriendly()
    {
        if (this.parent == undefined)
        {
            return false;
        }

        return this.parent == engine.getSystem("factory").player_factory;
    };


    draw()
    {
        const render  = engine.getSystem("render");
        const terrain = engine.getSystem("terrain");
        const player  = engine.getSystem("player");

        this.sprite.setRotation(this.rotation * this.body.rotation);
        this.sprite.draw(...this.body.position);
        this.draw_health();


        if (this.at_home())
        {
            this.health += 0.005*deltaTime;
            this.health = min(valueof(this.maxhealth), this.health);
        }

        if (this.selected == true)
        {
            const size = render.world_to_screen_dist(64);
            rectMode(CENTER);
            fill(0, 0, 0, 100);
            rect(...render.world_to_screen(...this.body.position), size, size);
        }

        if (this.at_destination() == false)
        {
            if (this.retreating == false && this.interrupt_path())
            {
                this.behaviour();
            }

            else
            {
                this.follow_path();
            }
 
            if (this.isFriendly())
            {
                terrain.pathfinder.drawPath(this.path, this.path_idx);
            }
        }

        else
        {
            this.behaviour();
        }

    };


    interrupt_path()
    {
        return false;
    };


    draw_health()
    {
        const render  = engine.getSystem("render");

        let screenspace = render.world_to_screen(
            this.body.position[0],
            this.body.position[1] - 2*this.body.radius
        );

        const w = render.world_to_screen_dist(2*this.body.radius);
        const h = render.world_to_screen_dist(8);

        rectMode(CENTER);

        fill(255, 0, 0);
        rect(...screenspace, w, h);

        fill(0, 255, 0);
        rect(...screenspace, w*(this.health/this.maxhealth), h);
    };


    follow_path()
    {
        const target = this.path[this.path_idx];

        this.body.applyForceTowards(...target, this.movespeed);

        const r = vec2_angle(vec2_normalize(this.body.velocity));
        this.body.setRotation(r);

        if (dist(...this.body.position, ...target) < 32.0)
        {
            this.path_idx -= 1;
        }
    };


    set_target( target )
    {
        const terrain = engine.getSystem("terrain");

        const T = [ valueof(target[0]), valueof(target[1]) ];

        this.last_target[0]    = valueof(this.current_target[0]);
        this.last_target[1]    = valueof(this.current_target[1]);
        this.current_target[0] = valueof(T[0]);
        this.current_target[1] = valueof(T[1]);

        this.path = terrain.pathfinder.find(...this.body.position, ...this.current_target);
        this.path_idx = this.path.length - 2;
    };


    at_home()
    {
        if (this.parent == undefined)
        {
            return false;
        }

        return dist(...this.body.position, ...this.parent.position) < 256;
    };


    retreat_and_return(lambda)
    {
        if (this.parent == undefined)
        {
            return;
        }

        if (this.retreating == true && lambda() == true)
        {
            this.set_target(this.last_target);
            this.retreating = false;
        }

        else if (this.retreating == false)
        {
            if (this.last_target == [NaN, NaN])
            {
                this.last_target = vec2_valueof(this.body.position);
            }

            this.set_target(vec2_add(this.parent.position, [0, -64]));
            this.retreating = true;
        }
    };


    body_visible( body )
    {
        const terrain = engine.getSystem("terrain");

        const dir = vec2_dir(body.position, this.body.position);
        const intersection = terrain.nearest_intersection(...this.body.position, ...dir);

        const x = intersection[0];
        const y = intersection[1];

        return distance2(...this.body.position, x, y) > distance2(...this.body.position, ...body.position);
    };


    at_destination()
    {
        return this.path_idx < 0;
    };


    behaviour()
    {

    };

};




class Gatherer extends Agent
{
    materials = [0.0, 0.0];
    holdings  = 0;
    capacity  = 1;

    dir = [1.0, 0.0];

    r = 0.0;
    rdir = Math.PI;

    was_on_gold = false;
    am_on_gold  = false;


    behaviour()
    {
        if (this.holdings < this.capacity)
        {
            this.gather();
            return;
        }

        this.retreat_and_return(() => {

            if (this.at_home() == false)
            {
                return false;
            }

            this.parent.monies += SILVER_VALUE * this.materials[0];
            this.parent.monies += GOLD_VALUE * this.materials[1];
            
            this.materials[0] = 0;
            this.materials[1] = 0;
            this.holdings = 0.0;

            return true;
        });
    };


    gather()
    {
        const render = engine.getSystem("render");
        const terrain = engine.getSystem("terrain");

        const cosr = cos(this.r);
        const sinr = sin(this.r);

        const dx = this.dir[0]*cosr - this.dir[1]*sinr;
        const dy = this.dir[1]*cosr + this.dir[0]*sinr;

        const data = terrain.nearest_intersection(...this.body.position, dx, dy);
        const blocktype = data[4];

        // stroke(255);
        // strokeWeight(4);
        // line(...render.world_to_screen(...this.body.position), ...render.world_to_screen(data[0], data[1]));

        if (blocktype == BLOCK_SILVER || blocktype == BLOCK_GOLD)
        {
            if (dist(...this.body.position, data[0], data[1]) < 32)
            {
                const dir = vec2_sub([data[0], data[1]], this.body.position);

                const x = this.body.position[0] + dir[0]/2;
                const y = this.body.position[1] + dir[1]/2;

                terrain.placeSphere(x, y, BLOCK_AIR, 2, 16);

                this.materials[blocktype - BLOCK_SILVER] += 2*8;
                this.holdings += 1;
                // strokeWeight(8);
            }

            else
            {
                this.body.applyForce(dx, dy, 0.001*deltaTime);
                // stroke(255, 255, 255, 100);
                // strokeWeight(1);
            }

            this.am_on_gold = true;

            // line(...render.world_to_screen(...this.body.position), ...render.world_to_screen(data[0], data[1]));
            // strokeWeight(1);
        }

        else
        {
            this.am_on_gold = false;
        }

        if (this.was_on_gold == true && this.am_on_gold == false)
        {
            this.rdir *= -1.0;
        }
        // strokeWeight(1);

        this.was_on_gold = valueof(this.am_on_gold);

        this.r += this.rdir * (deltaTime/10.0);
    };

};




class Security extends Agent
{
    weapon;

    constructor( sprite )
    {
        super( sprite );

        this.movespeed = 0.01;
        this.maxhealth = SECURITY_HEALTH;
        this.weapon = engine.getSystem("weapon").createWeapon(WEAPON_SHOTGUN);
    }

    subreset()
    {
        if (this.isFriendly())
        {
            this.weapon.bullet_type = FRIENDLY_BULLET;
        }
        else
        {
            this.weapon.bullet_type = UNFRIENDLY_BULLET;
        }

        this.rotation = false;
    };

    behaviour()
    {
        if (this.isFriendly())
        {
            this.friendly_behaviour();
        }

        else
        {
            this.unfriendly_behaviour();
        }

        if (this.health < 25.0 || this.retreating)
        {
            this.retreat_and_return(() => { return this.health >= this.maxhealth; });
        }
    };


    attack( body )
    {
        if (this.body_visible(body) == false)
        {
            return;
        }

        const dir = vec2_dir(body.position, this.body.position);
        const origin = vec2_add(this.body.position, vec2_mult(dir, 64.0));
        this.body.setRotation(vec2_angle(dir));

        this.weapon.pew(...origin, ...dir);
    };


    friendly_behaviour()
    {
        const physics = engine.getSystem("physics");
        const bodies = physics.grid.getBodiesXY(...this.body.position);
        
        for (let body of bodies)
        {
            if (body.label != UNFRIENDLY_AGENT)
            {
                continue;
            }

            if (this.body_visible(body))
            {
                this.attack(body);
                break;
            }
        }
    };


    unfriendly_behaviour()
    {
        const physics = engine.getSystem("physics");
        const bodies = physics.grid.getBodiesXY(...this.body.position);

        for (let body of bodies)
        {
            if (body.label != FRIENDLY_AGENT && body.label != PLAYER_AGENT)
            {
                continue;
            }

            if (this.body_visible(body))
            {
                this.attack(body);
                break;
            }
        }
    };

};




class Human extends Agent
{
    weapon; // = new Weapon(1500, 0.6, FRIENDLY_BULLET);

    constructor( sprite )
    {
        super(sprite);
        this.weapon = engine.getSystem("weapon").createWeapon(WEAPON_RIFLE);
        this.maxhealth = SOLDIER_HEALTH;
    };

    subreset()
    {
        if (this.isFriendly())
        {
            this.weapon.bullet_type = FRIENDLY_BULLET;
        }
        else
        {
            this.weapon.bullet_type = UNFRIENDLY_BULLET;
        }
    };


    interrupt_path()
    {
        const physics = engine.getSystem("physics");
        const bodies  = physics.grid.getBodiesXY(...this.body.position);

        if (this.health < 50.0)
        {
            this.retreat_and_return(() => { return this.health >= valueof(this.maxhealth); });
            return false;
        }

        for (let body of bodies)
        {
            if (this.body.label == UNFRIENDLY_AGENT)
            {
                if (body.label == PLAYER_AGENT || body.label == FRIENDLY_AGENT)
                if (this.body_visible(body))
                {
                    return true;
                }
            }

            else if (this.body.label == FRIENDLY_AGENT && body.label == UNFRIENDLY_AGENT)
            {
                if (this.body_visible(body))
                {
                    return true;
                }
            }
        }

        return false;
    };


    behaviour()
    {
        if (this.isFriendly())
        {
            this.friendly_behaviour();
        }

        else
        {
            this.unfriendly_behaviour();
        }

        if (this.health < 50.0 || this.retreating)
        {
            this.retreat_and_return(() => { return this.health >= valueof(this.maxhealth); });
        }
    };


    attack( body )
    {
        if (this.body_visible(body) == false)
        {
            return;
        }

        const dir = vec2_dir(body.position, this.body.position);
        const origin = vec2_add(this.body.position, vec2_mult(dir, 64.0));
        this.body.setRotation(vec2_angle(dir));

        const shot = this.weapon.pew(...origin, ...dir);
        
        if (shot)
        {
            this.weapon.cooldown = 500 * Math.PI * (0.45 + abs(abnormalDist(2)));
        }
    };


    control_tool()
    {
        const render = engine.getSystem("render");
        const keylog = engine.getSystem("keylog");
        const player = engine.getSystem("player");

        const worldspace = render.mouse_worldspace;
        const x  = this.body.position[0];
        const y  = this.body.position[1];
        const r  = 3*this.body.radius;

        if (point_in_AABB(...worldspace, x, y, r, r))
        {
            const size = render.world_to_screen_dist(r);

            rectMode(CENTER);
            fill(0, 255, 0, 100);
            rect(
                ...render.world_to_screen(x, y),
                size, size
            )

            if (keylog.mouseClicked())
            {
                [this.body.position, player.body.position] = [player.body.position, this.body.position];
                [this.health, player.health] = [player.health, this.health];
            }
        }
    };


    friendly_behaviour()
    {
        const player  = engine.getSystem("player");
        const physics = engine.getSystem("physics");
        const bodies  = physics.grid.getBodiesXY(...this.body.position);

        if (player.tool_mode == TOOL_CONTROL)
        {
            this.control_tool();
        }

        for (let body of bodies)
        {
            if (body.label != UNFRIENDLY_AGENT && body.label != "ENEMY_FACTORY")
            {
                continue;
            }

            if (this.body_visible(body))
            {
                this.attack(body);
                break;
            }
        }
    };


    unfriendly_behaviour()
    {
        const physics = engine.getSystem("physics");
        const bodies = physics.grid.getBodiesXY(...this.body.position);

        for (let body of bodies)
        {
            if (body.label != FRIENDLY_AGENT && body.label != PLAYER_AGENT && body.label != "PLAYER_FACTORY")
            {
                continue;
            }

            if (this.body_visible(body))
            {
                this.attack(body);
                break;
            }
        }
    };

};




class Guard extends Agent
{
    behaviour()
    {
        
    };
};