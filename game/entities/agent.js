let guard0, guard1, guard2, guard3;


class Agent
{
    sprite;
    body;
    health = 100.0;
    parent = undefined;
    friendly = false;

    selected  = false;
    energy    = 10.0;
    inventory = [ 0, 0, 0, 0 ];

    last_target = [ 0, 0 ];
    current_target = [ 0, 0 ];

    path = [  ];
    reversed_path = [  ];
    path_idx = -1;

    retreating = false;


    constructor( sprite )
    {
        this.body = new PhysicsBody(random(-150, 150), random(-150, 150), 32, 32, "agent");
        this.body.drag = 0.2;
        this.sprite = sprite;
    };


    reset( sprite )
    {
        this.body.drag = 0.2;
        this.sprite = sprite;
    };


    isFriendly()
    {
        // return this.friendly;
        return this.parent == engine.getSystem("factory").player_factory;
    };


    draw()
    {
        const render  = engine.getSystem("render");
        const terrain = engine.getSystem("terrain");
        const player  = engine.getSystem("player");

        if (this.selected == true)
        {
            const size = render.world_to_screen_dist(64);
            rectMode(CENTER);
            fill(0, 0, 0, 100);
            rect(...render.world_to_screen(...this.body.position), size, size);
        }

        if (this.at_destination() == false)
        {
            this.follow_path();
 
            // if (terrain.visualize_pathfinding)
            {
                terrain.pathfinder.drawPath(this.path, this.path_idx);
            }
        }

        else
        {
            this.behaviour();
        }

        this.body.update();

        this.sprite.setRotation(this.body.rotation);
        this.sprite.draw(...this.body.position);
    };


    follow_path()
    {
        const target = this.path[this.path_idx];

        this.body.applyForceTowards(...target, 0.05);

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
        return dist(...this.body.position, 0, 0) < 128;
    };


    retreat_and_return()
    {
        if (this.at_home())
        {
            console.log("At home!");

            this.health = 100.0;
            this.set_target(this.last_target);
            console.log("REVERSED: ", this.last_target);
            this.retreating = false;
        }

        else if (this.at_destination())
        {
            this.reversed_path = [];
            for (let i=this.path.length-1; i>=0; i--)
            {
                this.reversed_path.push(this.path[i]);
            }

            this.set_target(this.parent.position);
            this.retreating = true;
        }
    };


    player_visible()
    {
        const player = engine.getSystem("player");
        const terrain = engine.getSystem("terrain");

        const dir = vec2_dir(player.position, this.body.position);
        const intersection = terrain.nearest_intersection(...this.body.position, ...dir);

        const x = intersection[0];
        const y = intersection[1];

        return distance2(...this.body.position, x, y) > distance2(...this.body.position, ...player.position);
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
    holdings  = 0.0;
    capacity  = 5.0;

    dir = [1.0, 0.0];

    r = 0.0;
    rdir = Math.PI;

    was_on_gold = false;
    am_on_gold  = false;

    returning_home = false;

    return_home()
    {
        this.set_target([0, 0]);

        this.reversed_path = [];
        for (let i=this.path.length-1; i>=0; i--)
        {
            this.reversed_path.push(this.path[i]);
        }
    };


    behaviour()
    {
        if (this.at_home() && this.holdings >= this.capacity)
        {
            this.parent.monies += SILVER_VALUE * this.materials[0];
            this.parent.monies += GOLD_VALUE * this.materials[1];

            this.materials[0] = 0;
            this.materials[1] = 0;
            this.holdings = 0.0;

            this.path = this.reversed_path;
            this.path_idx = this.path.length - 2;
            return;
        }

        if (this.holdings < this.capacity)
        {
            this.gather();
        }

        else
        {
            if (this.at_home() == false)
            {
                this.return_home();
            }
        }
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
            if (dist(...this.body.position, data[0], data[1]) < 16)
            {
                const dir = vec2_sub([data[0], data[1]], this.body.position);

                const x = this.body.position[0] + dir[0]/2;
                const y = this.body.position[1] + dir[1]/2;

                terrain.placeSphere(x, y, BLOCK_AIR, 2, 16);

                this.materials[blocktype - BLOCK_SILVER] += 2*2*16;
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
        strokeWeight(1);

        this.was_on_gold = valueof(this.am_on_gold);

        this.r += this.rdir * (deltaTime/10.0);
    };

};




class Attacker extends Agent
{
    weapon_spread   = 0.3;
    weapon_cooldown = 0.0;
    reload_time     = 500.0;

    can_see_player()
    {
        const player = engine.getSystem("player");
        const terrain = engine.getSystem("terrain");

        const dir = vec2_dir(player.position, this.body.position);
        const intersection = terrain.nearest_intersection(...this.body.position, ...dir);

        const x = intersection[0];
        const y = intersection[1];

        return distance2(...this.body.position, x, y) > distance2(...this.body.position, ...player.position);
    };


    behaviour()
    {
        const player = engine.getSystem("player");
        const terrain = engine.getSystem("terrain");
        const bulletSys = engine.getSystem("bullet");


        if (this.can_see_player())
        {
            this.sprite.image(guard3)
        }

        else
        {
            this.sprite.image(guard0)
        }


        if (this.weapon_cooldown > this.reload_time)
        {
            // raycast towards player to ensure they are visible to the attacker
            if (this.can_see_player())
            {
                bulletSys.createBullet_startEnd(
                    ...this.body.position,
                    ...player.position,
                    this.weapon_spread,
                    ATTACKER_BULLET
                );
                this.weapon_cooldown = 0.0;
                this.time_since_player = 0.0;
            }

        }

        this.time_since_player += deltaTime;
        this.weapon_cooldown += deltaTime;
    };

};




class Human extends Agent
{
    weapon = new Weapon(1500, 0.25, REE_BULLET);
    retreating = false;
    timer  = 0.0;

    constructor( sprite )
    {
        super(sprite);
        
        this.body.resolution = (other) => {

            if (other.label >= PLAYER_BULLET && other.label <= REE_BULLET)
            {
                const damage = other.generic_data;
                this.health -= damage;
            }
        };
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

        if (this.health < 90.0)
        {
            this.retreat_and_return();
        }

        this.timer += deltaTime;
    };


    attack( body )
    {
        const dir = vec2_dir(body.position, this.body.position);
        const tangent = vec2_tangent(dir);

        const origin = vec2_add(this.body.position, vec2_mult(dir, 64.0));
        this.body.setRotation(vec2_angle(dir));

        const radiusSQ = max(this.body.radius, body.radius)**2;

        if (distance2(...this.body.position, ...body.position) < 2*radiusSQ);
        {
            this.body.position[0] -= dir[0] * 0.02*deltaTime;
            this.body.position[1] -= dir[1] * 0.02*deltaTime;
        }

        this.body.position[0] += tangent[0] * 0.02*deltaTime;
        this.body.position[1] += tangent[1] * 0.02*deltaTime;

        if (this.timer >= this.weapon.cooldown)
        {
            this.weapon.pew(...origin, ...dir);
            this.timer = 0.0;
        }
    };


    friendly_behaviour()
    {
        const render = engine.getSystem("render");
        const physics = engine.getSystem("physics");

        // Search for unfriendlies
        const bodies = physics.grid.getBodiesXY(...this.body.position);
        
        for (let body of bodies)
        {
            if (body.label != AGENT_REE || body == this.body)
            {
                continue;
            }

            if (body.generic_data.isFriendly())
            {
                continue;
            }

            this.attack(body);
            break;
        }
    };


    unfriendly_behaviour()
    {
        const terrain = engine.getSystem("terrain");
        const player = engine.getSystem("player");
        const render = engine.getSystem("render");
        const physics = engine.getSystem("physics");
        const bodies = physics.grid.getBodiesXY(...this.body.position);

        for (let body of bodies)
        {
            if (body.label != AGENT_REE || body == this.body)
            {
                continue;
            }

            if (body.generic_data.isFriendly() == false)
            {
                continue;
            }

            // this.attack(body);
        }


        // const dir = vec2_dir(player.position, this.body.position);
        // const origin = vec2_add(this.body.position, vec2_mult(dir, 64.0));

        // const data = terrain.nearest_intersection(...origin, ...dir);
        // const end = player.position;

        // if (this.player_visible())
        // {
        //     stroke(255, 0, 0, 100);
        //     fill(255, 0, 0, 100);
        //     line(...render.world_to_screen(...origin), ...render.world_to_screen(...end));
        //     circle(...render.world_to_screen(...end), 10);

        //     this.body.setRotation(vec2_angle(dir));

        //     if (this.timer >= this.weapon.cooldown)
        //     {
        //         this.weapon.pew(...origin, ...dir);
        //         this.timer = 0.0;
        //     }
        // }
    };

};




class Guard extends Agent
{
    behaviour()
    {
        
    };
};