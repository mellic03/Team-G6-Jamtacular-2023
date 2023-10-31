"use strict";

const QUADTREE_SPAN = 1024.0;
const HALF_SPAN = QUADTREE_SPAN / 2;

const COMPUTEBUFFER_WIDTH = 256;

const SECTORS_X = 4;
const SECTORS_Y = 4;


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


    preload( engine )
    {

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
    };


    draw( engine )
    {
        const render = engine.getSystem("render");
        const pg = render.offline_context;

        pg.background(0);
        pg.shader(render.quadtree_shader);

        render.quadtree_shader.setUniform("un_view_pos", render.view_pos);
        render.quadtree_shader.setUniform("mouseX", mouseX-render.res_x/2);
        render.quadtree_shader.setUniform("mouseY", mouseY-render.res_y/2);
        // translate(-128, 0);

        for (let cell of this.visible_sectors)
        {
            let row = cell[0];
            let col = cell[1];

            render.quadtree_shader.setUniform("un_quadtree",     this.sectors[row][col].buffer());
            render.quadtree_shader.setUniform("un_quadtree_pos", [col*QUADTREE_SPAN, row*QUADTREE_SPAN]);

            pg.rect(0, 0, render.res_min, render.res_min);
            // pg.rect(0, -128, render.res_min, render.res_min);
        }

        image(pg, 0, 0, render.res_min, render.res_min);
        // image(pg, 128, 0, render.res_min, render.res_min);


        // for (let cell of this.visible_sectors)
        // {
        //     let row = cell[0];
        //     let col = cell[1];
        //     this.sectors[row][col].draw(-render.view_pos[0], -render.view_pos[1]);
        // }
        // const x = render.view_pos[0];
        // const y = render.view_pos[1];
        // this.nearest_intersection(x, y, 1, 0);
    };


    nearest_intersection( x, y, dx, dy )
    {
        const sector = this.get_sector(x, y);
        const row = sector[0];
        const col = sector[1];

        return this.sectors[row][col].nearest_intersection(x, y, dx, dy);
    };
};