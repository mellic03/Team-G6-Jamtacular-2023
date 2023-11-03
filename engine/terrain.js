"use strict";

const QUADTREE_SPAN = 1024.0;
const HALF_SPAN = QUADTREE_SPAN / 2;
const COMPUTEBUFFER_WIDTH = 64;

const SECTORS_X = 4;
const SECTORS_Y = 4;


const TERRAIN_VIEW_WIDTH_PIXELS  = 1024;
const TERRAIN_VIEW_HEIGHT_PIXELS = 1024;


const BLOCK_AIR    = 0;
const BLOCK_GRASS  = 1;
const BLOCK_DIRT   = 2;
const BLOCK_STONE  = 3;
const BLOCK_SILVER = 4;
const BLOCK_GOLD   = 5;



function get_quadrant( x, y, cx, cy )
{
    let quadrant = int(0);

    if (x < cx) { quadrant |= 1 };
    if (y < cy) { quadrant |= 2 };

    return quadrant;
}


class TerrainSystem
{
    buffers = [  ];
    sectors = [  ];

    block_changes   = [  ];
    visible_sectors = [  ];

    quadtree_shader;


    constructor() {  };


    __row_from_y( y )
    {
        for (let row=0; row<SECTORS_Y; row++)
        {
            const top    = QUADTREE_SPAN*row - HALF_SPAN;
            const bottom = QUADTREE_SPAN*row + HALF_SPAN;

            if (top < y && y < bottom)
            {
                return row;
            }
        }

        return -1;  // Return -1 if out of bounds.
    };


    __col_from_x( x )
    {
        for (let col=0; col<SECTORS_X; col++)
        {
            const left  = QUADTREE_SPAN*col - HALF_SPAN;
            const right = QUADTREE_SPAN*col + HALF_SPAN;

            if (left < x && x < right)
            {
                return col;
            }
        }

        return -1;  // Return -1 if out of bounds.
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
        sectors.push([row, col]);


        let filtered = [  ];

        for (let i=0; i<4; i++)
        {
            let cell = sectors[i];

            if (0 <= cell[0] && cell[0] < SECTORS_Y)
            {
                if (0 <= cell[1] && cell[1] < SECTORS_X)
                {
                    filtered.push(cell);
                }
            }
        }

        return filtered;
    }

    // __get_visible_sectors( quadrant, row, col )
    // {
    //     let sectors = [
    //         [row-1, col-1], [row-1, col], [row-1, col+1],
    //         [row,   col-1], [row,   col], [row,   col+1],
    //         [row+1, col-1], [row+1, col], [row+1, col+1]
    //     ];

    //     let filtered = [  ];

    //     for (let i=0; i<9; i++)
    //     {
    //         let cell = sectors[i];

    //         if (0 <= cell[0] && cell[0] < SECTORS_Y)
    //         {
    //             if (0 <= cell[1] && cell[1] < SECTORS_X)
    //             {
    //                 filtered.push(cell);
    //             }
    //         }
    //     }

    //     console.log(frameRate());
    //     return filtered;
    // }


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

        if (sector_row == -1 || sector_col == -1)
        {
            console.log("[TerrainSystem::unlock] Player out of bounds");
            return;
        }

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


    preload( engine )
    {
        this.quadtree_shader = loadShader(
            "engine/render/shaders/screenquad.vs",
            "engine/render/shaders/quadtree.fs"
        );

        this.mapimg = loadImage("map.png");

    };


    setup( engine )
    {
        let pg = engine.getSystem("render").offline_context;

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
        let d = this.mapimg.pixelDensity();

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
        const pg = render.offline_context;

        const viewport_w = render.viewport_w;
        const viewport_h = render.viewport_h;


        pg.background(0);
        pg.shader(this.quadtree_shader);

        this.__set_common_uniforms(engine);

        this.quadtree_shader.setUniform("un_view_pos", render.view_pos);
        this.quadtree_shader.setUniform("mouseX", mouseX - viewport_w/2);
        this.quadtree_shader.setUniform("mouseY", mouseY - viewport_h/2);

        let idx = 0;

        for (let cell of this.visible_sectors)
        {
            let row = cell[0];
            let col = cell[1];

            this.quadtree_shader.setUniform("un_quadtree" + int(idx), this.sectors[row][col].buffer());
            this.quadtree_shader.setUniform("un_quadtree_pos" + int(idx), [col*QUADTREE_SPAN, row*QUADTREE_SPAN]);

            idx += 1;
        }

        pg.rect(0, 0, viewport_w, viewport_h);
        image(pg, 0, 0, viewport_w, viewport_h);

        // for (let cell of this.visible_sectors)
        // {
        //     let row = cell[0];
        //     let col = cell[1];
        //     this.sectors[row][col].draw(...render.world_to_screen(...render.view_pos));
        // }
    };


    increment = 0.0;

    __set_common_uniforms( engine )
    {
        const render = engine.getSystem("render");
        const player = engine.getSystem("player");

        this.quadtree_shader.setUniform( "QUADTREE_BUFFER_WIDTH", int(COMPUTEBUFFER_WIDTH) );
        this.quadtree_shader.setUniform( "QUADTREE_SPAN",         int(QUADTREE_SPAN)       );
        this.quadtree_shader.setUniform( "QUADTREE_HALF_SPAN",    int(HALF_SPAN)           );
        this.quadtree_shader.setUniform( "VIEWPORT_W",            int(render.viewport_w)   );
        this.quadtree_shader.setUniform( "VIEWPORT_H",            int(render.viewport_h)   );
        this.quadtree_shader.setUniform( "un_target_pos",         int(player.target)       );
        
        
        this.quadtree_shader.setUniform( "un_lightsource_pos_0", player.light_a );
        this.quadtree_shader.setUniform( "un_lightsource_pos_1", player.light_b );
        this.quadtree_shader.setUniform( "un_increment",         this.increment );
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