"use strict";

const QUADTREE_SPAN = 1024.0;
const HALF_SPAN = QUADTREE_SPAN / 2;
const COMPUTEBUFFER_WIDTH = 64;

const SECTORS_X = 4;
const SECTORS_Y = 4;


const TERRAIN_VIEW_WIDTH_PIXELS  = 1024;
const TERRAIN_VIEW_HEIGHT_PIXELS = 1024;



function get_quadrant( x, y, cx, cy )
{
    let quadrant = int(0);

    if (x < cx) { quadrant |= 1; };
    if (y < cy) { quadrant |= 2; };

    return quadrant;
}


class TerrainSystem
{
    quadtree_shader;

    buffers = [  ];
    sectors = [  ];

    block_changes   = [  ];
    visible_sectors = [  ];

    visualize_quadtree    = false;
    visualize_pathfinding = false;
    pathfinder = new PathFinder();

    shaders  = [  ];
    fidelity = 0;


    constructor()
    {

    };


    __row_from_y( y )
    {
        let row = floor((y + HALF_SPAN) / QUADTREE_SPAN) % SECTORS_Y;

        if (row < 0)
        {
            row = SECTORS_Y + row;
        }

        return row; 
    };


    __col_from_x( x )
    {
        let col = Math.floor((x + HALF_SPAN) / QUADTREE_SPAN) % SECTORS_X;

        if (col < 0)
        {
            col = SECTORS_X + col;
        }

        return col; 
    };


    __get_visible_sectors( quadrant, row, col )
    {
        let sectors = [  ];

        switch (quadrant)
        {
            case 0: sectors = [ [row, col+1], [row+1, col], [row+1, col+1] ]; break;
            case 1: sectors = [ [row, col-1], [row+1, col], [row+1, col-1] ]; break;
            case 2: sectors = [ [row, col+1], [row-1, col], [row-1, col+1] ]; break;
            case 3: sectors = [ [row, col-1], [row-1, col], [row-1, col-1] ]; break;
        }


        let filtered = [  ];
        filtered.push([row, col]);

        for (let i=0; i<3; i++)
        {
            let cell = sectors[i];

            cell[0] %= SECTORS_Y;
            cell[1] %= SECTORS_X;

            if (cell[0] < 0)  { cell[0] = SECTORS_Y + cell[0]; };
            if (cell[1] < 0)  { cell[1] = SECTORS_X + cell[1]; };

            filtered.push(cell);
        }

        return filtered;
    }


    get_sector( x, y )
    {
        return [ this.__row_from_y(y), this.__col_from_x(x) ];
    };

    
    in_bounds( row, col )
    {
        return row >= 0 && row < SECTORS_Y && col >= 0 && col < SECTORS_X;
    };


    lock()
    {
        for (let cell of this.visible_sectors)
        {
            let row = cell[0];
            let col = cell[1];

            this.sectors[row][col].nodegroups.unmapBuffer();
        }
    };


    unlock( x, y, w, h )
    {
        const sector = this.get_sector(x, y);
    
        const sector_row = sector[0];
        const sector_col = sector[1];
        
        const sector_x = sector_col * QUADTREE_SPAN;
        const sector_y = sector_row * QUADTREE_SPAN;

        let quadrant = get_quadrant(x, y, sector_x, sector_y);

        this.visible_sectors = this.__get_visible_sectors(quadrant, sector_row, sector_col);


        for (let cell of this.visible_sectors)
        {
            let row = cell[0];
            let col = cell[1];

            this.sectors[row][col].nodegroups.mapBuffer();
        }
    };



    unlockAll( )
    {
        this.visible_sectors = [ ];
        
        for (let i=0; i<SECTORS_Y; i++)
        {
            for (let j=0; j<SECTORS_X; j++)
            {
                this.visible_sectors.push([i, j]);
                this.sectors[i][j].nodegroups.mapBuffer();
            }
        }
    };


    placeBlock( x, y, blocktype, size )
    {
        let row = this.__row_from_y(y);
        let col = this.__col_from_x(x);

        if (row == -1 || col == -1)
        {
            console.log("[TerrainSystem::placeBlock] coordinates out of bounds");
            return;
        }

        this.sectors[row][col].insert(x, y, blocktype, size);
    };


    placeSphere( x, y, blocktype, radius, span )
    {
        for (let i=y-radius*span; i<y+radius*span; i+=span)
        {
            for (let j=x-radius*span; j<x+radius*span; j+=span)
            {
                if (dist(j, i, x, y) < radius*span)
                {
                    this.placeBlock(j, i, blocktype, span);
                }
            }
        }
    };


    /**
     * @param {*} x 
     * @param {*} y
     * @returns [blocktype, span]
     */
    getBlock( x, y )
    {
        let row = this.__row_from_y(y);
        let col = this.__col_from_x(x);

        if (row == -1 || col == -1)
        {
            // console.log("[TerrainSystem::placeBlock] coordinates out of bounds");
            return;
        }

        const data = this.sectors[row][col].find(x, y);
        return [data[0], data[3]];
    };


    preload( engine )
    {
        this.shaders[0] = loadShader(
            "engine/render/shaders/screenquad.vs",
            "engine/render/shaders/quadtree-fast.fs"
        );

        this.shaders[1] = loadShader(
            "engine/render/shaders/screenquad.vs",
            "engine/render/shaders/quadtree-flat.fs"
        );

        this.shaders[2] = loadShader(
            "engine/render/shaders/screenquad.vs",
            "engine/render/shaders/quadtree.fs"
        );

        this.shaders[3] = loadShader(
            "engine/render/shaders/screenquad.vs",
            "engine/render/shaders/quadtree-dark.fs"
        );

        this.shaders[4] = loadShader(
            "engine/render/shaders/screenquad.vs",
            "engine/render/shaders/cool-shading.fs"
        );

        this.mapimg = loadImage("map.png");

    };


    setup( engine )
    {
        let pg = engine.getSystem("render").offlineContext(0);

        for (let row=0; row<SECTORS_Y; row++)
        {
            this.sectors.push([]);
            this.buffers.push([]);

            for (let col=0; col<SECTORS_X; col++)
            {
                const x = QUADTREE_SPAN * col;
                const y = QUADTREE_SPAN * row;

                const cb = new ComputeBuffer(COMPUTEBUFFER_WIDTH, COMPUTEBUFFER_WIDTH, pg, COMPUTEBUFFER_FLOAT);
                const qt = new Quadtree(x, y, QUADTREE_SPAN, cb);

                this.buffers[row].push(cb);
                this.sectors[row].push(qt);
            }
        }


        this.unlockAll();
        this.mapimg.loadPixels();
        let data = this.mapimg.pixels;

        const IMG_W = 1024;
        for (let y=0; y<IMG_W; y++)
        {
            for (let x=0; x<IMG_W; x++)
            {
                const idx = 4*(y*IMG_W + x);

                if (data[idx] < 10)
                {
                    continue;
                }

                if (data[idx+0] < 20)
                {
                    this.placeBlock((x*4)-HALF_SPAN, (y*4)-HALF_SPAN, 1, 16);
                }

                else if (data[idx+0] < 30)
                {
                    this.placeBlock((x*4)-HALF_SPAN, (y*4)-HALF_SPAN, 2, 16);
                }
                else if (data[idx+0] < 40)
                {
                    this.placeBlock((x*4)-HALF_SPAN, (y*4)-HALF_SPAN, 3, 16);
                }
            }
        }

        this.lock();
    };


    draw( engine )
    {
        const render = engine.getSystem("render");
        const player = engine.getSystem("player");
        const pg = render.offlineContext(0);

        const viewport_w = render.viewport_w;
        const viewport_h = render.viewport_h;


        pg.background(0);
        pg.shader(this.getShader());

        this.__set_common_uniforms(engine);

        this.getShader().setUniform("un_view_pos", render.view_pos);
        this.getShader().setUniform("mouseX", mouseX - viewport_w/2);
        this.getShader().setUniform("mouseY", mouseY - viewport_h/2);

        let idx = 0;

        for (let cell of this.visible_sectors)
        {
            let row = cell[0];
            let col = cell[1];

            this.getShader().setUniform("un_quadtree" + int(idx), this.sectors[row][col].buffer());
            this.getShader().setUniform("un_quadtree_pos" + int(idx), [col*QUADTREE_SPAN, row*QUADTREE_SPAN]);

            idx += 1;
        }

        pg.rect(0, 0, viewport_w, viewport_h);
        image(pg, 0, 0, viewport_w, viewport_h);


        this.pathfinder.refine(this);

        if (this.visualize_quadtree)
        {
            for (let cell of this.visible_sectors)
            {
                let row = cell[0];
                let col = cell[1];
                this.sectors[row][col].draw(...render.world_to_screen(...render.view_pos));
            }
        }

        if (this.visualize_pathfinding)
        {
            this.pathfinder.draw();
        }

    };


    __set_common_uniforms( engine )
    {
        const render = engine.getSystem("render");
        const player = engine.getSystem("player");

        this.getShader().setUniform( "QUADTREE_BUFFER_WIDTH", int(COMPUTEBUFFER_WIDTH) );
        this.getShader().setUniform( "QUADTREE_SPAN",         int(QUADTREE_SPAN)       );
        this.getShader().setUniform( "QUADTREE_HALF_SPAN",    int(HALF_SPAN)           );
        this.getShader().setUniform( "VIEWPORT_W",            int(render.viewport_w)   );
        this.getShader().setUniform( "VIEWPORT_H",            int(render.viewport_h)   );
        this.getShader().setUniform( "un_target_pos",         player.target            );
        this.getShader().setUniform( "un_player_pos",         player.position          );
        this.getShader().setUniform( "un_mouse",              render.screen_to_world(mouseX, mouseY));
        this.getShader().setUniform( "un_lightsource_pos_0",  player.light_a           );
        this.getShader().setUniform( "un_lightsource_pos_1",  player.light_b           );
    };


    getShader()
    {
        return this.shaders[this.fidelity];
    };


    nearest_intersection( x, y, dx, dy )
    {
        // If intersection is outside original sector, perform another search. 
        let intersection = [0, 0];
        let count = 10;

        let point = [x, y];

        while (count > 0 && intersection.length == 2)
        {
            const sector = this.get_sector(...point);
            const row = sector[0];
            const col = sector[1];
    
            if (this.in_bounds(row, col) == false)
            {
                return [Infinity, Infinity];
            }

            intersection = this.sectors[row][col].nearest_intersection(...point, dx, dy);
            point = intersection;

            count -= 1;
        }

        return intersection
    };

    
    getSectors()
    {
        return this.sectors;
    };


    toFile( filepath )
    {
        let lists = [  ];
        
        for (let row=0; row<SECTORS_Y; row++)
        {
            for (let col=0; col<SECTORS_X; col++)
            {
                lists.push(...this.sectors[row][col].leafList());
            }
        }

        save(lists, filepath);
    }
};