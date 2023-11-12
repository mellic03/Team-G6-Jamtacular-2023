
const FACTORY_PLAYER = 0;
const FACTORY_ENEMY  = 1;


const OUTER_RADIUS     = 360;
const OUTER_THICKNESS  = 4;

const INNER_RADIUS     = 224;
const INNER_THICKNESS  = 4;


let factory_constant_attack = false;


/*
    Factories create entities like collectors.
*/
class Factory
{
    sprite;
    body;
    health = 500;
    alive  = true;

    position   = [0, 0];
    monies     = 20.0;
    collectors = [  ];
    timer = 0.0;

    lightsource = new Pointlight(1, 0, 1);


    constructor( x, y, sprite, friendly=false )
    {
        const terrain = engine.getSystem("terrain");

        let mid, outer, inner;

        // Outer shell
        // -------------------------------------------------------------
        outer = floor(OUTER_RADIUS/8) + OUTER_THICKNESS/2;
        inner = floor(OUTER_RADIUS/8) - OUTER_THICKNESS/2;
        mid   = OUTER_RADIUS;

        terrain.placeSphere(x, y, BLOCK_STONE, outer, 8);
        terrain.placeSphere(x, y, BLOCK_AIR,   inner, 8);

        terrain.placeRect(x+mid, y, BLOCK_AIR, 64, 128);
        terrain.placeRect(x-mid, y, BLOCK_AIR, 64, 128);
        terrain.placeRect(x, y+mid, BLOCK_AIR, 128, 64);
        terrain.placeRect(x, y-mid, BLOCK_AIR, 128, 64);
        // -------------------------------------------------------------

        // Inner shell
        // -------------------------------------------------------------
        outer = floor(INNER_RADIUS/8) + INNER_THICKNESS/2;
        inner = floor(INNER_RADIUS/8) - INNER_THICKNESS/2;
        mid   = INNER_RADIUS - 16*INNER_THICKNESS;

        terrain.placeSphere(x, y, BLOCK_STONE, outer, 8);
        terrain.placeSphere(x, y, BLOCK_AIR,   inner, 8);

        terrain.placeRect(x-mid, y-mid, BLOCK_AIR, 128, 128, +45);
        terrain.placeRect(x-mid, y+mid, BLOCK_AIR, 128, 128, -45);
        terrain.placeRect(x+mid, y-mid, BLOCK_AIR, 128, 128, +45);
        terrain.placeRect(x+mid, y+mid, BLOCK_AIR, 128, 128, -45);
        // -------------------------------------------------------------


        this.sprite = sprite;


        if (friendly)
        {
            this.body = new PhysicsBody(x, y, 32, 32, "PLAYER_FACTORY");
            this.body.body_resolution = (other) => {

                if (other.label == UNFRIENDLY_BULLET)
                {
                    this.health -= 5;
                }
            };
        }

        else
        {
            this.body = new PhysicsBody(x, y, 32, 32, "ENEMY_FACTORY");
            this.body.body_resolution = (other) => {

                if (other.label == PLAYER_BULLET || other.label == FRIENDLY_BULLET)
                {
                    this.health -= 5;
                }
            };
        }
    
        this.position = this.body.position;

        this.lightsource.diffuse = vec3_rand(0.0, 1.0);
        this.lightsource.position[0] = this.position[0];
        this.lightsource.position[1] = this.position[1];
        this.lightsource.linear      = 0.5;
        this.lightsource.quadratic   = 0.5;

        this.lightsource.s_constant  = 0.0;
        this.lightsource.s_linear    = 0.5;
        this.lightsource.s_quadratic = 0.5;
        this.lightsource.s_radius    = 32.0;

    };


    enable_light()
    {
        const light = engine.getSystem("light");
        light.getPointlight(1).copy(this.lightsource);
    };


    death()
    {
        const terrain = engine.getSystem("terrain");
        terrain.placeSphere(...this.position, BLOCK_GOLD, 8, 8);

        this.lightsource.diffuse  = [0, 0, 0];
        this.lightsource.position = [-1000, -1000];
    };


    draw( engine )
    {
        if (this.health <= 0)
        {
            if (this.alive)
            {
                this.death();
                this.alive = false;
            }

            return;
        }

        else
        {
            this.health = min(500, this.health + 0.001*deltaTime);
        }

        this.sprite.draw(...this.position);
        this.draw_health();

        if (this != engine.getSystem("factory").player_factory)
        {
            this.unfriendly_behaviour();
        }

        const render = engine.getSystem("render");
        const player = engine.getSystem("player");
        const keylog = engine.getSystem("keylog");
        const UIsys  = engine.getSystem("ui");

        if (player.tool_mode != TOOL_INSPECT)
        {
            return;
        }


        if (this != engine.getSystem("factory").player_factory && is_devmode() == false)
        {
            return;
        }

        if (dist(...this.position, ...render.mouse_worldspace) < 32.0)
        {
            fill(0, 0, 0, 100);
            rectMode(CENTER);
            
            const size = render.world_to_screen_dist(64);
            rect(...render.world_to_screen(...this.position), size, size);

            if (keylog.mouseClicked2())
            {
                UIsys.modals[MODAL_FACTORY].show(this);
            }
        }

    };


    unfriendly_behaviour()
    {
        const factorySys = engine.getSystem("factory");

        if (factory_constant_attack)
        {
            if (this.timer > 1000 * 5)
            {
                dowith_probability(0.2, () => {
    
                    this.monies += 1000;
                    this.launch_attack(factorySys.player_factory);
                });
    
                this.timer = 0.0;
            }
    
            return;
        }

        if (this.timer > 1000 * 120)
        {
            dowith_probability(0.2, () => {

                this.monies += 1000;
                this.launch_attack(factorySys.player_factory);
            });

            this.timer = 0.0;
        }

        this.timer += deltaTime;
    };

    
    launch_attack( factory )
    {
        const pos = factory.position;

        const mid = INNER_RADIUS - 16*INNER_THICKNESS;
        const offsets = [
            [pos[0]-mid, pos[1]-mid],
            [pos[0]-mid, pos[1]+mid],
            [pos[0]+mid, pos[1]-mid],
            [pos[0]+mid, pos[1]+mid]
        ];

        const cost = engine.getSystem("agent").costOf(AGENT_SOLDIER);
        if (this.monies < 4*cost)
        {
            return;
        }

        for (let i=0; i<4; i++)
        {
            const soldier = this.createAgent(AGENT_SOLDIER);
            soldier.set_target(offsets[i]);
        }
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
        rect(...screenspace, w*(this.health/500), h);
    };


    createAgent( type )
    {
        const cost = engine.getSystem("agent").costOf(type);

        if (this.monies >= cost)
        {
            const agentSys = engine.getSystem("agent");
         
            const bound = INNER_RADIUS - 16*INNER_THICKNESS;
            let x = this.position[0] + random(-bound, +bound);
            let y = this.position[1] + random(-bound, +bound);

            const agent = agentSys.createAgent(type, x, y, this);

            x = this.position[0] + random(-bound, +bound);
            y = this.position[1] + random(-bound, +bound);
            agent.set_target([x, y]);

            this.monies -= cost;

            return agent;
        }
    };

};




function enemy_factory_init()
{
    const factorySys = engine.getSystem("factory");
    const terrain    = engine.getSystem("terrain");


    factorySys.player_factory = factorySys.createFactory(1200, -48, FACTORY_PLAYER);
    factorySys.player_factory.createAgent(AGENT_SOLDIER);
    factorySys.player_factory.createAgent(AGENT_GATHERER);
    factorySys.player_factory.monies = 20;

    const player = engine.getSystem("player");
    player.body.position = vec2_valueof(factorySys.player_factory.position);


    let enemy_positions = [ [64, 1504], [2000, 2856], [3000, 1000] ];

    for (let pos of enemy_positions)
    {
        const factory = factorySys.createFactory(...pos, FACTORY_ENEMY);

        factory.monies += 400;
        factory.createAgent(AGENT_SOLDIER);
        factory.createAgent(AGENT_SOLDIER);
    }


    for (let i=0; i<256; i++)
    {
        terrain.pathfinder.refine(terrain);
    }


    factorySys.factories[1].monies += 1000;
    let SEC = factorySys.factories[1].createAgent(AGENT_SECURITY);
    SEC.set_target([624, 1504]);


    factorySys.factories[2].monies += 2000;
    SEC = factorySys.factories[2].createAgent(AGENT_SECURITY);
    SEC.set_target([2000, 2300]);
    SEC = factorySys.factories[2].createAgent(AGENT_SECURITY);
    SEC.set_target([1400, 2800]);


    factorySys.factories[3].monies += 1000;
    SEC = factorySys.factories[3].createAgent(AGENT_SECURITY);
    SEC.set_target([3000, 1504]);


    const pfactory = factorySys.player_factory;
    pfactory.monies += 400;
    let sec = pfactory.createAgent(AGENT_SOLDIER);
    sec.set_target([1200, 400]);
    sec = pfactory.createAgent(AGENT_SOLDIER);
    sec.set_target([800, -50]);

};





class FactorySystem
{
    player_factory;
    factories = [  ];

    sprites = [  ];


    preload( engine )
    {
        this.sprites[FACTORY_PLAYER] = new BSprite(0, 0, 32, 32);
        this.sprites[FACTORY_PLAYER].image(loadImage("factory.png"));

        this.sprites[FACTORY_ENEMY] = new BSprite(0, 0, 32, 32);
        this.sprites[FACTORY_ENEMY].image(loadImage("factory.png"));
    };


    setup( engine )
    {
        allSprites.autoDraw = false;
    };


    draw( engine )
    {
        this.player_factory.draw(engine);

        for (let factory of this.factories)
        {
            factory.draw(engine);
        }
    };


    createFactory( x, y, type )
    {
        const factory = new Factory(x, y, this.sprites[type], type == FACTORY_PLAYER);
        this.factories.push(factory);

        return factory;
    };


    addBodies()
    {
        const physics = engine.getSystem("physics");
    
        for (let i=0; i<this.factories.length; i++)
        {
            const factory = this.factories[i];

            if (factory.health <= 0)
            {
                continue;
            }
        
            physics.grid.addBody(factory.body);
        }
    };

};

