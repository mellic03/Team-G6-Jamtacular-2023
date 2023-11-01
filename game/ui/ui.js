

function testcallback()
{
    console.log("WOW!");
}




class UISystem
{
    DEBUGgrid;
    UIgrid;

    preload( engine )
    {

    };

    setup( engine )
    {
        const render = engine.getSystem("render");
        const keylog = engine.getSystem("keylog");

        const WIN_H = render.res_y;
        const UI_W  = render.res_x - render.res_min;

        this.DEBUGgrid = new ButtonGrid(
            render.res_min, 0, UI_W, WIN_H, 30, 2, keylog
        );

        this.UIgrid = new ButtonGrid(
            render.res_min, WIN_H/2, UI_W, WIN_H/2, 15, 2, keylog
        );
    };


    draw( engine )
    {
        const render  = engine.getSystem("render");
        const factory = engine.getSystem("factory");
        const terrain = engine.getSystem("terrain");
        const keylog  = engine.getSystem("keylog");
        const player  = engine.getSystem("player");


        // Reset mouse lock, if mouse is still over UI then enable it again
        // ----------------------------------------------------------------
        keylog.unlockMouse();

        if (this.DEBUGgrid.mouseInBounds())
        {
            keylog.lockMouse();
        }
        // ----------------------------------------------------------------

        this.draw_sector_memusage(engine);

        this.draw_dev_ui(engine);



    };


    draw_sector_memusage( engine )
    {
        const factory = engine.getSystem("factory");
        const terrain = engine.getSystem("terrain");


        this.DEBUGgrid.background(100);

        const sectors = terrain.getSectors();

        this.DEBUGgrid.menuButton(0, 0, "cur");
        this.DEBUGgrid.menuButton(0, 1, "max");


        let n = 1;
        for (let row=0; row<4; row++)
        {
            for (let col=0; col<4; col++)
            {
                this.DEBUGgrid.menuButton(n, 0, sectors[row][col].currentBufferUsage().toFixed(2));
                this.DEBUGgrid.menuButton(n, 1, sectors[row][col].maxBufferUsage().toFixed(2));
                n += 1;
            }
        }
    };


    draw_dev_ui( engine )
    {
        const render  = engine.getSystem("render");
        const terrain = engine.getSystem("terrain");
        const player  = engine.getSystem("player");

        
        let blocktype = player.block_type;

        const ROW_START = 12;

        this.UIgrid.menuButton(ROW_START+0, 0, "air", () => {
            blocktype = BLOCK_AIR;
        }, blocktype === BLOCK_AIR);


        this.UIgrid.menuButton(ROW_START+0, 1, "grass", () => {
            blocktype = BLOCK_GRASS;
        },  blocktype === BLOCK_GRASS);


        this.UIgrid.menuButton(ROW_START+1, 0, "dirt", () => {
            blocktype = BLOCK_DIRT;
        },  blocktype === BLOCK_DIRT);
        this.UIgrid.menuButton(ROW_START+1, 1, "stone", () => {
            blocktype = BLOCK_STONE;
        },  blocktype === BLOCK_STONE);


        this.UIgrid.menuButton(ROW_START+2, 0, "silver", () => {
            blocktype = BLOCK_SILVER;
        },  blocktype === BLOCK_SILVER);
        this.UIgrid.menuButton(ROW_START+2, 1, "gold", () => {
            blocktype = BLOCK_GOLD;
        },  blocktype === BLOCK_GOLD);


        player.block_type = blocktype;
    };


};

