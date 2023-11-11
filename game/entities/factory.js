
const FACTORY_PLAYER = 0;
const FACTORY_ENEMY  = 1;


/*
    Factories create entities like collectors.
*/
class Factory
{
    sprite;
    body;
    health = 100;
    alive  = true;

    position   = [0, 0];
    monies     = 1000.0;
    collectors = [  ];


    constructor( x, y, sprite, friendly=false )
    {
        const terrain = engine.getSystem("terrain");
        terrain.placeSphere(x, y, BLOCK_STONE, 36, 8);
        terrain.placeSphere(x, y, BLOCK_AIR,   32, 8);
        terrain.placeRect(x+256, y, BLOCK_AIR, 64, 64);
        terrain.placeRect(x-256, y, BLOCK_AIR, 64, 64);
        terrain.placeRect(x, y+256, BLOCK_AIR, 64, 64);
        terrain.placeRect(x, y-256, BLOCK_AIR, 64, 64);

        terrain.placeRect(x+150, y, BLOCK_STONE, 16, 64);
        terrain.placeRect(x-150, y, BLOCK_STONE, 16, 64);
        terrain.placeRect(x, y+150, BLOCK_STONE, 64, 16);
        terrain.placeRect(x, y-150, BLOCK_STONE, 64, 16);

        this.sprite = sprite;
        this.body = new PhysicsBody(x, y, 32, 32, "FACTORY");
        this.position = this.body.position;


        if (friendly)
        {
            this.body.body_resolution = (other) => {

                if (other.label == UNFRIENDLY_BULLET)
                {
                    this.health -= 5;
                }
            };
        }

        else
        {
            this.body.body_resolution = (other) => {

                if (other.label == PLAYER_BULLET || other.label == FRIENDLY_BULLET)
                {
                    this.health -= 5;
                }
            };
        }
    };


    death()
    {
        const terrain = engine.getSystem("terrain");
        terrain.placeSphere(...this.position, BLOCK_GOLD, 8, 8);
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

        this.sprite.draw(...this.position);
        this.draw_health();

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

            if (keylog.mouseClicked())
            {
                UIsys.modals[MODAL_FACTORY].show(this);
            }
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
        rect(...screenspace, w*(this.health/100), h);
    };


    createAgent( type )
    {
        const cost = engine.getSystem("agent").costOf(type);

        if (this.monies >= cost)
        {
            const agentSys = engine.getSystem("agent");
            agentSys.createAgent(type, this);

            this.monies -= cost;
        }
    };

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


    createAgent( factory_id, type )
    {
        // const agentSys = engine.getSystem("agent");

        // const factory = this.getFactory(factory_id);
        // const cost    = agentSys.costOf(type);

        // if (factory.monies >= cost)
        // {
        //     const collector_id = agentSys.createCollector(type);
        //     factory.agents.push(collector_id);
        //     factory.monies -= cost;
        // }
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

