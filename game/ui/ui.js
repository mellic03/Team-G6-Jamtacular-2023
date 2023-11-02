
class UISystem
{
    UIgrid;

    DEBUGgrid;
    BRUSHgrid;

    proportion_ui = 0.2;
    player_factory_id;


    onWindowResize( engine )
    {
        const render = engine.getSystem("render");
        const keylog = engine.getSystem("keylog");

        const WIN_H = render.res_y;

        const UI_LEFT  = render.res_x * (1.0 - this.proportion_ui);
        const UI_WIDTH = render.res_x - UI_LEFT;

        this.UIgrid = new ButtonGrid(
            UI_LEFT, 0, UI_WIDTH, WIN_H, 30, 2, keylog
        );

        this.DEBUGgrid = new ButtonGrid(
            UI_LEFT, 0, UI_WIDTH, WIN_H, 30, 2, keylog
        );

        this.BRUSHgrid = new ButtonGrid(
            UI_LEFT, WIN_H/2, UI_WIDTH, WIN_H/2, 15, 2, keylog
        );
    };


    preload( engine )
    {

    };


    setup( engine )
    {
        this.onWindowResize(engine);

        const factory = engine.getSystem("factory");
        this.player_factory_id = factory.createFactory(FACTORY_PLAYER);
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

        // this.draw_sector_memusage(engine);
        this.draw_game_ui(engine);
        this.draw_dev_ui(engine);
    };


    draw_game_ui( engine )
    {
        const player = engine.getSystem("player");
        const factorySys = engine.getSystem("factory");
        const id = this.player_factory_id;
        const playerFactory = factorySys.getFactory(id);

        this.UIgrid.background(100);


        let row = 2;
        this.UIgrid.menuButton(row+0, 0, "$" + playerFactory.monies);


        this.UIgrid.menuButton(row+1, 0, "Build A", () => {
            factorySys.buildCollector(id, COLLECTOR_A);
        });

        this.UIgrid.menuButton(row+1, 1, "Build B", () => {
            factorySys.buildCollector(id, COLLECTOR_B);
        });



        this.UIgrid.menuButton(row+2, 0, "terrain", () => {
            player.tool_mode = 0;
        }, player.tool_mode == 0);

        this.UIgrid.menuButton(row+2, 1, "target", () => {
            player.tool_mode = 1;
        }, player.tool_mode == 1);


        this.UIgrid.menuButton(row+3, 0, "light A", () => {
            player.tool_mode = 2;
        }, player.tool_mode == 2);

        this.UIgrid.menuButton(row+3, 1, "light B", () => {
            player.tool_mode = 3;
        }, player.tool_mode == 3);
    };



    draw_sector_memusage( engine )
    {
        const factory = engine.getSystem("factory");
        const terrain = engine.getSystem("terrain");

        this.DEBUGgrid.background(100);
        this.DEBUGgrid.menuButton(0, 0, "cur");
        this.DEBUGgrid.menuButton(0, 1, "max");

        const sectors = terrain.getSectors();

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

        let blocktype  = player.block_type;
        let blockspan  = player.block_width;
        let ksize      = player.block_ksize;

        let row = 9;

        this.BRUSHgrid.menuButton(row+0, 0, "span*2", () => {
            blockspan *= 2;
        });
        this.BRUSHgrid.menuButton(row+0, 1, "span/2", () => {
            blockspan /= 2;
        });

        this.BRUSHgrid.menuButton(row+1, 0, "ksize*2", () => {
            ksize *= 2;
        });
        this.BRUSHgrid.menuButton(row+1, 1, "ksize/2", () => {
            ksize /= 2;
        });


        row = 12;

        this.BRUSHgrid.menuButton(row+0, 0, "air", () => {
            blocktype = BLOCK_AIR;
        }, blocktype === BLOCK_AIR);
        this.BRUSHgrid.menuButton(row+0, 1, "grass", () => {
            blocktype = BLOCK_GRASS;
        },  blocktype === BLOCK_GRASS);


        this.BRUSHgrid.menuButton(row+1, 0, "dirt", () => {
            blocktype = BLOCK_DIRT;
        },  blocktype === BLOCK_DIRT);
        this.BRUSHgrid.menuButton(row+1, 1, "stone", () => {
            blocktype = BLOCK_STONE;
        },  blocktype === BLOCK_STONE);


        this.BRUSHgrid.menuButton(row+2, 0, "silver", () => {
            blocktype = BLOCK_SILVER;
        },  blocktype === BLOCK_SILVER);
        this.BRUSHgrid.menuButton(row+2, 1, "gold", () => {
            blocktype = BLOCK_GOLD;
        },  blocktype === BLOCK_GOLD);


        player.block_type  = blocktype;
        player.block_width = blockspan;
        player.block_ksize = ksize;

    };

};

