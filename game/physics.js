

class PhysicsBody
{
    label;
    generic_data;

    position;
    velocity;
    rotation;

    last_position;
    velocity_mag;
    velocity_magSq;

    width;
    height;
    radius;

    hasDrag = true;
    drag    = 0.05;

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


    setRotation( r )
    {
        this.rotation = r;
    };


    resolution( body )
    {

    };

};


COLLISION_SECTORS_X = 16;
COLLISION_SECTORS_Y = 16;
COLLISION_SECTOR_SPAN = QUADTREE_SPAN/4;

class CollisionGrid
{
    // Grid is a 2D array of lists. Each list contains references to which objects exist there.
    grid = [];

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
        this.grid[cell[0]][cell[1]].push(body);
    };


    getNeighbours( row, col )
    {
        let neighbours = [
            [row,   col+1], [row-1, col+1], [row+1, col+1],
            [row-1, col],   [row-1, col-1], [row,   col-1],
            [row+1, col],   [row+1, col-1], [row,   col]
        ];


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


    getBodies( row, col )
    {
        const neighbours = this.getNeighbours(row, col);

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
        return this.getBodies(...this.world_to_grid(x, y));
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
    };


    draw()
    {
        const render = engine.getSystem("render");

        rectMode(CENTER);
        noFill();

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
    };
};



class PhysicsSystem
{
    grid = new CollisionGrid();


    preload()
    {

    };


    setup()
    {

    };


    dothing( body1, neighbours )
    {
        for (let body2 of neighbours)
        {
            if (body1 == body2)
            {
                continue;
            }

            const radiusSQ = max(body1.radius, body2.radius)**2;
            const distanceSQ = distance2(...body1.position, ...body2.position);

            if (distanceSQ < deltaTime*deltaTime*body1.velocity_magSq)
            {
                const line_dist_SQ = point_line_dist_SQ(
                    ...body2.position,
                    ...body1.position,
                    ...vec2_add(body1.position, body1.velocity)
                );

                if (line_dist_SQ < radiusSQ)
                {
                    body1.resolution(body2);
                    body2.resolution(body1); 
                }
            }
        }
    };


    draw()
    {
        const render = engine.getSystem("render");
        const grid = this.grid.grid;

        for (let row=0; row<COLLISION_SECTORS_Y; row++)
        {
            for (let col=0; col<COLLISION_SECTORS_X; col++)
            {
                const neighbours = this.grid.getBodies(row, col);

                for (let body of grid[row][col])
                {
                    // circle(...render.world_to_screen(...body.position), render.world_to_screen_dist(body.radius));
                    this.dothing(body, neighbours);
                }
            }
        }

        this.grid.clear();
    };

};


