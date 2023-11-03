
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

    resources = [  ];

    energy    = 10.0;

    constructor( type )
    {
        this.position[0] = random(-500, +500);
        this.position[1] = random(-500, +500);

        this.sprite = new BSprite(0, 0, 50, 50 );
    };

    draw()
    {
        this.sprite.drawXY(...this.position);

        const target = engine.getSystem("player").target;

        this.direction = vec2_sub(target, this.position);
        this.direction = vec2_normalize(this.direction);
        this.direction = vec2_mult(this.direction, 0.005);

        if (dist(...this.position, ...target) < 64.0)
        {
            this.direction = vec2_mult(this.direction, -1);
        }

        this.velocity = vec2_add(this.velocity, this.direction);
        this.velocity = vec2_mult(this.velocity, 0.95);

        this.collisions(engine);

        this.energy = clamp(this.energy + 0.01*deltaTime, 0.0, 10.01);

        this.position = vec2_multadd(this.position, this.velocity, deltaTime);
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

        terrain.unlock(...player.position);

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

                if (distance < 64)
                {
                    let dir = vec2_sub(collector2.position, collector.position);
                    dir = vec2_normalize(dir);

                    dir = vec2_mult(dir, -(1.0 / (1.0 + distance)));
                    let dir2 = vec2_mult(dir, -1);

                    collector.velocity  = vec2_add(collector.velocity, dir);
                    collector2.velocity = vec2_add(collector2.velocity, dir2);

                }

            }
        }
        terrain.lock();
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

