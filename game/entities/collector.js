
/*
    Collectors are agents which move out into the world and collect resources.
    When a resource is collected, it returns to the "mothership" to deposit it.
*/
const COLLECTOR_A = 0;
const COLLECTOR_B = 1;
const COLLECTOR_C = 2;
const COLLECTOR_D = 3;



class Collector
{
    sprite;
    position = [0.0, 0.0]

    direction = [0.0, 0.0];
    velocity  = [0.0, 0.1];


    selected  = false;
    energy    = 10.0;
    inventory = [ 0, 0, 0, 0 ];


    path = [  ];
    player_target = [0.0, 0.0];
    current_target = -1;


    constructor( type )
    {
        this.position[0] = random(-150, 150);
        this.position[1] = random(-150, 150);

        this.sprite  = new BSprite(-100, -100, 50, 50 );
        this.sprite2 = new BSprite(-100, -100, 50, 50 );

        this.sprite.collider = "none";
    };


    draw()
    {
        if (this.selected == true)
        {
            this.sprite.drawXY(-1000, -1000);
            this.sprite2.drawXY(...this.position);
        }

        else
        {
            this.sprite2.drawXY(-1000, -1000);
            this.sprite.drawXY(...this.position);
        }

        const terrain = engine.getSystem("terrain");

        if (this.current_target >= 0)
        {
            this.follow_path();
 
            if (terrain.visualize_pathfinding)
            {
                terrain.pathfinder.drawPath(this.path);
            }
        }

    };


    follow_path( )
    {
        const target = this.path[this.current_target];
        
        this.direction = vec2_sub(target, this.position);
        
        if (vec2_magSq(this.direction) < 0.05)
        {
            this.current_target -= 1;
            return;
        }

        this.direction = vec2_normalize(this.direction);


        this.velocity = vec2_add(this.velocity, this.direction);
        this.velocity = velocityDampening(0.55, ...this.velocity);

        this.energy = clamp(this.energy + 0.01*deltaTime, 0.0, 10.01);
        this.position = vec2_multadd(this.position, this.velocity, deltaTime);

           
        if (dist(...this.position, ...target) < 32.0)
        {
            this.current_target -= 1;
        }
    };


    set_target( target )
    {
        const terrain = engine.getSystem("terrain");

        const T = [ valueof(target[0]), valueof(target[1]) ];
        this.path = terrain.pathfinder.find(...this.position, ...T);
        this.current_target = this.path.length - 1;
    };



    unset_target( )
    {
        this.path = [ ];
        this.current_target = -1;
    };


    collisions( engine )
    {
        const terrain = engine.getSystem("terrain");
        const render = engine.getSystem("render");

        let dx = this.velocity[0];
        let dy = this.velocity[1];
        let mag = Math.sqrt(dx**2 + dy**2);
        let data = terrain.nearest_intersection(...this.position, dx/mag, dy/mag);


        const px = data[0];
        const py = data[1];
        // const nx = data[2];
        // const ny = data[3];
        const distance = dist(...this.position, px, py);


        if (distance < 64)
        {
            if (this.energy > 10.0)
            {
                terrain.placeSphere(px, py, 0, 4, 8);

                strokeWeight(16);
                stroke(255, 0, 0);
                line(...render.world_to_screen(...this.position), ...render.world_to_screen(px, py));
                circle(...render.world_to_screen(px, py), 32);
           
                this.energy -= 10.0;
            }
        }

        if (distance < 1.0 * deltaTime)
        {
            this.velocity[0] -= (1.0 / distance) * Math.sign(this.velocity[0]);
            this.velocity[1] -= (1.0 / distance) * Math.sign(this.velocity[1]);
        }
    
        strokeWeight(1);
        stroke(255);
    }

};


class CollectorSystem
{
    allocator     = new Allocator(Collector);
    sprite_imgs   = [  ];
    collector_ids = [  ];
    costs         = [  ];

    preload( engine )
    {
        this.sprite_imgs[COLLECTOR_A] = loadImage("collector.png");
        this.sprite_imgs[COLLECTOR_B] = loadImage("collector.png");
    };


    setup( engine )
    {
        this.costs[COLLECTOR_A] = 10;
        this.costs[COLLECTOR_B] = 50;
        this.costs[COLLECTOR_C] = 100;
        this.costs[COLLECTOR_D] = 200;
    };


    draw( engine )
    {
        const terrain = engine.getSystem("terrain");
        const player  = engine.getSystem("player");

        // terrain.unlock(...player.position);

        const data = engine.getEvent("player", "selection");
        this.find_selected(data);

    
        for (let id of this.collector_ids)
        {
            const collector = this.allocator.get(id);
            collector.draw();
            
            for (let id2 of this.collector_ids)
            {
                if (id == id2)
                {
                    continue;
                }

                const collector2 = this.allocator.get(id2);
                const distance = dist(...collector2.position, ...collector.position);

                let dir = vec2_sub(collector.position, collector2.position);                
                dir = vec2_normalize(dir);

                if (distance > 64.0)
                {
                    continue;
                }

                dir = vec2_mult(dir, 0.25); 
                collector.velocity = vec2_add(collector.velocity, dir);

                dir = vec2_mult(dir, -1.0); 
                collector2.velocity = vec2_add(collector2.velocity, dir);
            }
        }
        // terrain.lock();
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
            console.log("target");
    
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
            
                const px = collector.position[0];
                const py = collector.position[1];

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
            // collector.unset_target();
        }
    };


    createCollector( type )
    {
        const id = this.allocator.create();
        const collector = this.allocator.get(id);
        collector.sprite.image(this.sprite_imgs[type]);
        this.collector_ids.push(id);
    };


    costOf( type )
    {
        return this.costs[type];
    };
};

