
/*
    Collectors are agents which move out into the world and collect resources.
    When a resource is collected, it returns to the "mothership" to deposit it.
*/
const COLLECTOR_GATHER = 0;
const COLLECTOR_DEFEND = 1;
const COLLECTOR_ATTACK = 3;

let collector_sprites = [  ];


class Collector
{
    sprite;

    body;
    direction = [0.0, 0.0];

    behaviour_mode = COLLECTOR_GATHER;

    selected  = false;
    energy    = 10.0;
    inventory = [ 0, 0, 0, 0 ];

    path = [  ];
    player_target = [0.0, 0.0];
    current_target = -1;

    constructor( type=COLLECTOR_GATHER )
    {
        this.body = new PhysicsBody(random(-150, 150), random(-150, 150), 32, 32);
        this.sprite = collector_sprites[type];
    };


    draw()
    {
        const render = engine.getSystem("render");
        const terrain = engine.getSystem("terrain");

        if (this.current_target >= 0)
        {
            this.follow_path();
 
            // if (terrain.visualize_pathfinding)
            {
                terrain.pathfinder.drawPath(this.path, this.current_target);
            }
        }


        if (this.selected == true)
        {
            const size = render.world_to_screen_dist(64);
            rectMode(CENTER);
            fill(0, 0, 0, 100);
            rect(...render.world_to_screen(...this.body.position), size, size);
        }


        this.body.update();
        this.sprite.draw(...this.body.position);
    };


    follow_path( )
    {
        const target = this.path[this.current_target];
        this.body.applyForceTowards(...target);

        if (dist(...this.body.position, ...target) < 32.0)
        {
            this.current_target -= 1;
        }
    };


    set_target( target )
    {
        const terrain = engine.getSystem("terrain");

        const T = [ valueof(target[0]), valueof(target[1]) ];
        this.path = terrain.pathfinder.find(...this.body.position, ...T);
        this.current_target = this.path.length - 2;
    };


    unset_target( )
    {
        this.path = [ ];
        this.current_target = -1;
    };

};


class CollectorSystem
{
    allocator     = new Allocator(Collector);
    collector_ids = [  ];
    costs         = [  ];

    preload( engine )
    {
        collector_sprites[COLLECTOR_GATHER] = new BSprite();
        collector_sprites[COLLECTOR_GATHER].image(loadImage("gather.png"));

        collector_sprites[COLLECTOR_DEFEND] = new BSprite();
        collector_sprites[COLLECTOR_DEFEND].image(loadImage("defend.png"));

        collector_sprites[COLLECTOR_ATTACK] = new BSprite();
        collector_sprites[COLLECTOR_ATTACK].image(loadImage("attack.png"));

    };


    setup( engine )
    {
        this.costs[COLLECTOR_GATHER] = 10;
        this.costs[COLLECTOR_DEFEND] = 50;
        this.costs[COLLECTOR_ATTACK] = 100;
    };


    draw( engine )
    {
        const terrain = engine.getSystem("terrain");
        const player  = engine.getSystem("player");


        const data = engine.getEvent("player", "selection");
        this.find_selected(data);

    
        for (let id of this.collector_ids)
        {
            const collector = this.allocator.get(id);
            collector.draw();
        }
    };


    find_selected( data )
    {
        if (data == undefined)
        {
            this.deselect_all();
            return;
        }

        if (data.header == "target")
        {
            for (let id of this.collector_ids)
            {
                const collector = this.allocator.get(id);

                if (collector.selected == true)
                {
                    collector.set_target(data.target);
                    collector.selected = false;
                }
            }
        }

        else if (data.header == "selection")
        {
            const tl = data.tl;
            const br = data.br;

            const xmin = tl[0];
            const ymin = tl[1];
            const xmax = br[0];
            const ymax = br[1];

            for (let id of this.collector_ids)
            {
                const collector = this.allocator.get(id);
            
                const px = collector.body.position[0];
                const py = collector.body.position[1];

                if (xmin < px && px < xmax && ymin < py && py < ymax)
                {
                    const screenspace = engine.getSystem("render").world_to_screen(px, py);
                    collector.selected = true;
                    circle(...screenspace, 20);
                }

                else
                {
                    collector.selected = false;
                }
            }
        }
    };


    deselect_all()
    {
        for (let id of this.collector_ids)
        {
            const collector = this.allocator.get(id);
            collector.selected = false;
        }
    };


    createCollector( type )
    {
        const id = this.allocator.create([type]);
        const collector = this.allocator.get(id);
        collector.behaviour_mode = type;
        this.collector_ids.push(id);
    };


    costOf( type )
    {
        return this.costs[type];
    };
};

