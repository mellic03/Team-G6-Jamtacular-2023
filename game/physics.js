
class PhysicsBody
{
    label;

    position;
    velocity;
    rotation;

    last_position;
    velocity_mag;
    velocity_magSq;
    velocity_dir = [  ];

    width;
    height;
    radius;
    radiusSQ;
    dir_rot = 0.0;

    hasDrag = true;
    drag    = 0.05;

    fast_collisions = true;

    constructor( x=0, y=0, w=32, h=32, label="" )
    {
        this.position = [x, y];
        this.velocity = [0, 0];
        this.rotation = 0.0;

        this.last_position  = [x, y];
        this.velocity_magSq = 0.0;
        
        this.width  = w;
        this.height = h;
        this.radius = w;
        this.radiusSQ = w*w;

        this.label = label;
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
        this.last_position[0] = valueof(this.position[0]);
        this.last_position[1] = valueof(this.position[1]);

        this.position[0] += deltaTime * this.velocity[0];
        this.position[1] += deltaTime * this.velocity[1];

        this.velocity_magSq  = vec2_magSq(this.velocity);
        this.velocity_mag    = sqrt(this.velocity_magSq);
        // this.velocity_dir[0] = this.velocity[0] / this.velocity_mag;
        // this.velocity_dir[1] = this.velocity[1] / this.velocity_mag;
        this.velocity_dir = vec2_normalize(this.velocity);

        if (this.hasDrag)
            this.velocity = velocityDampening(this.drag, ...this.velocity);

        this.dir_rot += deltaTime * Math.PI;
    };


    setRotation( r )
    {
        this.rotation = r;
    };


    body_resolution( body )
    {

    };


    terrain_resolution( ix, iy, nx, ny, d, blocktype )
    {
        const overlap = this.radius - d;
        this.position[0] += overlap * nx;
        this.position[1] += overlap * ny;
    };

};


COLLISION_SECTORS_X = 16;
COLLISION_SECTORS_Y = 16;
COLLISION_SECTOR_SPAN = QUADTREE_SPAN/4;

class CollisionGrid
{
    bodies = [  ];
    grid   = [  ];

    constructor()
    {
        for (let i=0; i<COLLISION_SECTORS_Y; i++)
        {
            this.grid.push([]);

            for (let j=0; j<COLLISION_SECTORS_X; j++)
            {
                this.grid[i].push([]);
            }
        }
    };


    world_to_grid( x, y )
    {
        let row = round((y + QUADTREE_SPAN/2 - COLLISION_SECTOR_SPAN/2) / COLLISION_SECTOR_SPAN);
        let col = round((x + QUADTREE_SPAN/2 - COLLISION_SECTOR_SPAN/2) / COLLISION_SECTOR_SPAN);

        return [row, col];
    };


    grid_to_world( row, col )
    {
        let x = (col * COLLISION_SECTOR_SPAN) - QUADTREE_SPAN/2 + COLLISION_SECTOR_SPAN/2;
        let y = (row * COLLISION_SECTOR_SPAN) - QUADTREE_SPAN/2 + COLLISION_SECTOR_SPAN/2;

        return [x, y];
    };


    addBody( body )
    {
        const cell = this.world_to_grid(...body.position);

        if (cell[1] < 0 || cell[1] > COLLISION_SECTORS_Y)
        {
            return;
        }

        if (cell[0] < 0 || cell[0] > COLLISION_SECTORS_X)
        {
            return;
        }

        this.bodies.push(body);
        this.grid[cell[0]][cell[1]].push(body);
    };


    first = true;

    getNeighbours( row, col, range=1 )
    {
        let neighbours = [  ];

        for (let r=row+1-range; r<row+range; r++)
        {
            for (let c=col+1-range; c<col+range; c++)
            {
                neighbours.push([r, c]);
            }
        }


        let filtered = [  ];

        for (let cell of neighbours)
        {
            if (cell[0] < 0 || cell[0] >= COLLISION_SECTORS_Y)
            {
                continue;
            }

            if (cell[1] < 0 || cell[1] >= COLLISION_SECTORS_X)
            {
                continue;
            }

            filtered.push(cell);
        }

        return filtered;
    };


    getBodies( row, col, range=1 )
    {
        const neighbours = this.getNeighbours(row, col, 3);

        let bodies = [  ];

        for (let cell of neighbours)
        {
            const subgrid = this.grid[cell[0]][cell[1]];

            for (let body of subgrid)
            {
                bodies.push(body);
            }
        }

        return bodies;
    };


    getBodiesXY( x, y, range=1 )
    {
        return this.getBodies(...this.world_to_grid(x, y, range));
    };


    clear()
    {
        for (let i=0; i<COLLISION_SECTORS_Y; i++)
        {
            this.grid.push([]);

            for (let j=0; j<COLLISION_SECTORS_X; j++)
            {
                this.grid[i][j].length = 0;
            }
        }

        this.bodies.length = 0;
    };


    draw()
    {
        const render = engine.getSystem("render");

        rectMode(CENTER);
        noFill();
        stroke(0);
        const size = render.world_to_screen_dist(COLLISION_SECTOR_SPAN);

        for (let row=0; row<COLLISION_SECTORS_Y; row++)
        {
            for (let col=0; col<COLLISION_SECTORS_X; col++)
            {
                const worldspace = this.grid_to_world(row, col);
                const screenspace = render.world_to_screen(...worldspace);

                rect(...screenspace, size, size);
            }
        }

        fill(255, 0, 0, 25);

        for (let row=0; row<COLLISION_SECTORS_Y; row++)
        {
            for (let col=0; col<COLLISION_SECTORS_X; col++)
            {
                for (let body of this.grid[row][col])
                {
                    let worldspace = this.grid_to_world(row, col);
                    let screenspace = render.world_to_screen(...worldspace);

                    rect(...screenspace, size, size);
                }
            }
        }


        stroke(0, 255, 0);
        noFill();

        for (let row=0; row<COLLISION_SECTORS_Y; row++)
        {
            for (let col=0; col<COLLISION_SECTORS_X; col++)
            {
                for (let body of this.grid[row][col])
                {
                    circle(
                        ...render.world_to_screen(...body.position),
                        render.world_to_screen_dist(2*body.radius)
                    );
                }
            }
        }

        stroke(0);
    };
};



class PhysicsSystem
{
    grid = new CollisionGrid();
    visualize_grid = false;

    preload()
    {

    };


    setup()
    {

    };


    body_body_collision( body1, neighbours )
    {
        const render = engine.getSystem("render");

        for (let body2 of neighbours)
        {
            if (body1 == body2)
            {
                continue;
            }

            const radiiSQ    = (body1.radius + body2.radius)**2;
            const dtSQ       = deltaTime**2;
            const next_pos   = vec2_add(body1.position, body1.velocity);

            const line_dist_SQ = point_line_dist_SQ(
                ...body2.position,
                ...body1.position,
                ...next_pos
            );

            if (line_dist_SQ > radiiSQ)
            {
                continue;
            }


            let tpos = vec2_point_to_line(
                body2.position,
                body1.position,
                next_pos
            );

            const tdistSQ = distance2(...body1.position, ...tpos);

            if (tdistSQ < dtSQ * body1.velocity_mag)
            {
                body1.body_resolution(body2);
                body2.body_resolution(body1); 
            }
        }
    };


    body_body_collisions()
    {
        const render = engine.getSystem("render");
        const grid = this.grid.grid;

        for (let row=0; row<COLLISION_SECTORS_Y; row++)
        {
            for (let col=0; col<COLLISION_SECTORS_X; col++)
            {
                const neighbours = this.grid.getBodies(row, col, 3);

                for (let body of grid[row][col])
                {
                    this.body_body_collision(body, neighbours);
                }
            }
        }
    };


    body_terrain_slow( body )
    {
        const render = engine.getSystem("render");
        const terrain = engine.getSystem("terrain");

        const dirs = [

            [-1, 0], [-1, -1], [0, -1], [+1, -1],
            [+1, 0], [+1, +1], [0, +1], [-1, +1]
        ];

        for (let dir of dirs)
        {
            const data = terrain.nearest_intersection(
                ...body.position,
                ...dir
            );
    
            const ix = data[0];
            const iy = data[1];
            const nx = data[2];
            const ny = data[3];
            const blocktype = data[4];


            // line(
            //     ...render.world_to_screen(...body.position),
            //     ...render.world_to_screen(...[ix, iy]),
            // );

            const radiusSQ  = body.radiusSQ;
            const distSQ    = distance2(...body.position, ix, iy);

            if (distSQ < radiusSQ)
            {
                body.terrain_resolution(ix, iy, -nx, -ny, sqrt(distSQ), blocktype);
            }
        }
    };


    body_terrain_fast( body )
    {
        const render = engine.getSystem("render");
        const terrain = engine.getSystem("terrain");

        const data = terrain.nearest_intersection(
            ...body.position,
            ...body.velocity_dir
        );

        const ix = data[0];
        const iy = data[1];
        const nx = data[2];
        const ny = data[3];
        const blocktype = data[4];


        // line(
        //     ...render.world_to_screen(...body.position),
        //     ...render.world_to_screen(...[ix, iy]),
        // );

        const radiusSQ  = body.radiusSQ;
        const distSQ    = distance2(...body.position, ix, iy);
        const dtSQ      = deltaTime*deltaTime;

        if (distSQ - radiusSQ < dtSQ * body.velocity_magSq)
        {
            const line_dist_SQ = point_line_dist_SQ(
                ix, iy,
                ...body.position,
                ...vec2_add(body.position, body.velocity)
            );

            if (line_dist_SQ <= radiusSQ)
            {
                body.terrain_resolution(ix, iy, -nx, -ny, sqrt(distSQ), blocktype);
                // fill(255, 0, 0);
                // circle(
                //     ...render.world_to_screen(...body.position),
                //     render.world_to_screen_dist(2*body.radius)
                // );
            }
        }
    };


    body_terrain_collisions()
    {
        stroke(255, 0, 0);

        for (let body of this.grid.bodies)
        {
            if (body.fast_collisions)
            {
                this.body_terrain_fast(body);
            }
            else
            {
                this.body_terrain_slow(body);
            }
        }
    };


    draw()
    {
        for (let body of this.grid.bodies)
        {
            body.update();
        }

        this.body_body_collisions();
        this.body_terrain_collisions();

        if (this.visualize_grid)
        {
            this.grid.draw();
        }

        this.grid.clear();
    };

};


