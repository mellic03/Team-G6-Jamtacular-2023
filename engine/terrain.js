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
    sectors_visible = [  ];

    visualize_quadtree    = false;
    visualize_pathfinding = false;
    pathfinder = new PathFinder();

    shaders  = [  ];
    fidelity = 1;

    mapimg;
    maptxt;


    constructor()
    {

    };


    preload( engine )
    {
        this.shaders[0] = loadShader(
            "engine/render/shaders/screenquad.vs",
            "engine/render/shaders/quadtree-no-lighting.fs"
        );

        this.shaders[1] = loadShader(
            "engine/render/shaders/screenquad.vs",
            "engine/render/shaders/quadtree-flat.fs"
        );

        this.shaders[2] = loadShader(
            "engine/render/shaders/screenquad.vs",
            "engine/render/shaders/quadtree.fs"
        );


        this.shaders[4] = loadShader(
            "engine/render/shaders/screenquad.vs",
            "engine/render/shaders/quadtree-vhigh.fs"
        );

        this.shaders[3] = loadShader(
            "engine/render/shaders/screenquad.vs",
            "engine/render/shaders/quadtree-dev.fs"
        );

        this.mapimg = loadImage("map2.png");
        this.maptxt = loadStrings("map.txt");
    };


    setup( engine )
    {
        let pg = engine.getSystem("render").offlineContext(0);

        for (let row=0; row<SECTORS_Y; row++)
        {
            this.sectors.push([]);
            this.buffers.push([]);
            this.sectors_visible.push([]);

            for (let col=0; col<SECTORS_X; col++)
            {
                const x = QUADTREE_SPAN * col;
                const y = QUADTREE_SPAN * row;

                const cb = new ComputeBuffer(COMPUTEBUFFER_WIDTH, COMPUTEBUFFER_WIDTH, pg, COMPUTEBUFFER_FLOAT);
                const qt = new Quadtree(x, y, QUADTREE_SPAN, cb);

                this.buffers[row].push(cb);
                this.sectors[row].push(qt);
                this.sectors_visible[row].push(false);
            }
        }


        this.unlockAll();

        // this.__load_from_png();
        this.__load_from_txt();

        // Place bedrock at borders
        for (let i=0; i<SECTORS_X*QUADTREE_SPAN; i+=32)
        {
            this.placeBlock(i-HALF_SPAN, 32 - HALF_SPAN, BLOCK_BEDROCK, 64);
            this.placeBlock(i-HALF_SPAN, SECTORS_Y*QUADTREE_SPAN - HALF_SPAN - 8, BLOCK_BEDROCK, 64);
        }
        for (let i=0; i<SECTORS_Y*QUADTREE_SPAN; i+=32)
        {
            this.placeBlock(8-HALF_SPAN, i-HALF_SPAN, BLOCK_BEDROCK, 64);
            this.placeBlock(SECTORS_Y*QUADTREE_SPAN - HALF_SPAN - 32, i-HALF_SPAN, BLOCK_BEDROCK, 64);
        }

        this.lock();
    };


    draw( engine )
    {
        this.pathfinder.refine(this);

        if (is_devmode())
        {
            this.__draw_devmode();
            return;
        }

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


    __draw_devmode()
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


        let row = 0;
        let col = 0;

        for (let row=0; row<SECTORS_Y; row++)
        {
            for (let col=0; col<SECTORS_X; col++)
            {
                this.getShader().setUniform("un_quadtree", this.sectors[row][col].buffer());
                this.getShader().setUniform("un_quadtree_pos", [col*QUADTREE_SPAN, row*QUADTREE_SPAN]);
                pg.rect(0, 0, viewport_w, viewport_h);
            }
        }

        image(pg, 0, 0, viewport_w, viewport_h);
    };


    __load_from_png()
    {
        this.mapimg.loadPixels();
        let data = this.mapimg.pixels;

        const IMG_W = 1024;

        let minv = +100000.0;
        let maxv = -100000.0;

        for (let y=0; y<IMG_W; y++)
        {
            for (let x=0; x<IMG_W; x++)
            {
                const idx = 4*(y*IMG_W + x);

                if (data[idx] < 50)
                {
                    continue;
                }

                minv = min(minv, data[idx]);
                maxv = max(maxv, data[idx]);

                this.placeBlock((x*4)-HALF_SPAN, (y*4)-HALF_SPAN, floor((data[idx]) / 50), 16);
            }
        }

        console.log(minv, maxv);
    };


    __load_from_txt()
    {
        const data = this.maptxt;

        for (let i=0; i<data.length-1; i+=4)
        {
            const blocktype = int(data[i+0]);
            const x         = int(data[i+1]);
            const y         = int(data[i+2]);
            const span      = float(data[i+3]);

            this.placeBlock(x, y, blocktype, span);
        }
    };


    increment = 0.0;

    __set_common_uniforms( engine )
    {
        const render = engine.getSystem("render");
        const lightSys = engine.getSystem("light");
        const player = engine.getSystem("player");

        this.getShader().setUniform( "QUADTREE_BUFFER_WIDTH", int(COMPUTEBUFFER_WIDTH) );
        this.getShader().setUniform( "QUADTREE_SPAN",         int(QUADTREE_SPAN)       );
        this.getShader().setUniform( "QUADTREE_HALF_SPAN",    int(HALF_SPAN)           );
        this.getShader().setUniform( "VIEWPORT_W",            int(render.viewport_w)   );
        this.getShader().setUniform( "VIEWPORT_H",            int(render.viewport_h)   );
        this.getShader().setUniform( "un_target_pos",         player.target            );
        this.getShader().setUniform( "un_player_pos",         player.position          );
        this.getShader().setUniform( "un_mouse",              render.screen_to_world(mouseX, mouseY));
        this.getShader().setUniform( "un_increment",          this.increment );

        lightSys.setUniforms(this.getShader());

        this.increment += 0.01;

        if (this.increment > 1000.0)
        {
            this.increment = 0.0;
        }
    };


    getShader()
    {
        return this.shaders[this.fidelity];
    };


    __row_from_y( y )
    {
        let row = floor((y + HALF_SPAN) / QUADTREE_SPAN) % SECTORS_Y;

        if (row < 0)          { row = 0;           };
        if (row >= SECTORS_Y) { row = SECTORS_Y-1; };

        return row; 
    };


    __col_from_x( x )
    {
        let col = Math.floor((x + HALF_SPAN) / QUADTREE_SPAN) % SECTORS_X;

        if (col < 0)          { col = 0;           };
        if (col >= SECTORS_X) { col = SECTORS_X-1; };

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

            if (cell[1] < 0 || cell[1] >= SECTORS_X)  { continue; };
            if (cell[0] < 0 || cell[0] >= SECTORS_Y)  { continue; };

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

            this.sectors_visible[row][col] = false;
            this.sectors[row][col].nodegroups.unmapBuffer();
        }

        this.visible_sectors = [  ];
    };


    unlock( x, y, w, h )
    {
        if (is_devmode())
        {
            this.unlockAll();
            return;
        }

        if (isNaN(x) || isNaN(y))
        {
            return;
        }

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

            this.sectors_visible[row][col] = true;
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
                this.sectors_visible[i][j] = true;
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

        if (this.sectors_visible[row][col] == false)
        {
            return;
        }

        this.sectors[row][col].insert(x, y, blocktype, size);
    };


    placeSphere( x, y, blocktype, radius, span )
    {
        for (let i=y-radius*span; i<=y+radius*span; i+=span)
        {
            for (let j=x-radius*span; j<=x+radius*span; j+=span)
            {
                if (dist(j, i, x, y) < radius*span)
                {
                    this.placeBlock(j, i, blocktype, span);
                }
            }
        }
    };


    placeRect( x, y, blocktype, width, height, angle=0.0 )
    {
        const sinr = sin(angle);
        const cosr = cos(angle);

        for (let wy=-height/2; wy<height/2; wy+=4)
        {
            for (let wx=-width/2; wx<width/2; wx+=4)
            {
                const X = wx*cosr - wy*sinr;
                const Y = wy*cosr + wx*sinr;

                this.placeBlock(x+X, y+Y, blocktype, 8);
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


    nearest_intersection( x, y, dx, dy )
    {
        // If intersection is outside original sector, perform another search. 
        let intersection = [x, y];
        let count = 10;

        while (count > 0 && intersection.length == 2)
        {
            const sector = this.get_sector(...intersection);
            const row = sector[0];
            const col = sector[1];
    
            if (this.in_bounds(row, col) == false)
            {
                return [Infinity, Infinity];
            }

            intersection = this.sectors[row][col].nearest_intersection(...intersection, dx, dy);

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