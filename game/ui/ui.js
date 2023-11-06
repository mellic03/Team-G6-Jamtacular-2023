
class UISystem
{
    UIgrid;

    DEBUGgrid;
    BRUSHgrid;

    settings_modal  = new SettingsModal(1, 1, 1, 1);
    inventory_modal = new InventoryModal(1, 1, 1, 1);
    factory_modal   = new FactoryModal(1, 1, 1, 1);

    proportion_ui = 0.2;
    player_factory_id;


    onWindowResize( engine )
    {
        const render = engine.getSystem("render");
        const keylog = engine.getSystem("keylog");

        const WIN_H = render.res_y;

        const UI_LEFT  = render.viewport_left;
        const UI_WIDTH = render.res_x - render.viewport_left;

        this.UIgrid = new ButtonGrid(
            UI_LEFT, 0, UI_WIDTH, WIN_H, 30, 2, keylog
        );

        this.DEBUGgrid = new ButtonGrid(
            UI_LEFT, 0, UI_WIDTH, WIN_H, 30, 2, keylog
        );

        this.BRUSHgrid = new ButtonGrid(
            UI_LEFT, WIN_H/2, UI_WIDTH, WIN_H/2, 15, 2, keylog
        );
    
        this.settings_modal.reposition(render.viewport_w/2 - UI_WIDTH, render.res_y/2 - UI_WIDTH, 2*UI_WIDTH, WIN_H/2);
        this.inventory_modal.reposition(render.viewport_w/2 - UI_WIDTH, render.res_y/2 - UI_WIDTH, 2*UI_WIDTH, WIN_H/2);
        this.factory_modal.reposition(render.viewport_w/2 - UI_WIDTH, render.res_y/2 - UI_WIDTH, 2*UI_WIDTH, WIN_H/2);
    };


    preload( engine )
    {

    };


    setup( engine )
    {
        const render = engine.getSystem("render");

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

        this.inventory_modal.draw();
        this.settings_modal.draw();
        this.factory_modal.draw();
    };


    draw_game_ui( engine )
    {
        const terrain = engine.getSystem("terrain");
        const player = engine.getSystem("player");
        const factorySys = engine.getSystem("factory");
        const id = this.player_factory_id;
        const playerFactory = factorySys.getFactory(id);

        this.UIgrid.background(100);

        let row = 2;
        this.UIgrid.menuButton(row+0, 0, "$" + playerFactory.monies);
        this.UIgrid.text_scale = 0.8;

        this.UIgrid.menuButton(row+1, 0, "Weapon", () => {
            player.tool_mode = TOOL_WEAPON;
        }, player.tool_mode == TOOL_WEAPON);

        this.UIgrid.menuButton(row+2, 0, "Inspect", () => {
            player.tool_mode = TOOL_INSPECT;
        }, player.tool_mode == TOOL_INSPECT);

        this.UIgrid.menuButton(row+2, 1, "Select", () => {
            player.tool_mode = TOOL_SELECT;
        }, player.tool_mode == TOOL_SELECT);

    


    
        this.UIgrid.menuButton(row+6, 0, "Inventory", () => {
            player.tool_mode = TOOL_NONE;
            this.inventory_modal.show();
        });

        this.UIgrid.menuButton(row+6, 1, "Settings", () => {
            player.tool_mode = TOOL_NONE;
            this.settings_modal.show();
        });





        this.UIgrid.menuButton(row+7, 0, "light A", () => {
            player.tool_mode = TOOL_LIGHT_A;
        }, player.tool_mode == TOOL_LIGHT_A);

        this.UIgrid.menuButton(row+7, 1, "light B", () => {
            player.tool_mode = TOOL_LIGHT_B;
        }, player.tool_mode == TOOL_LIGHT_B);


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

        let using_terrain = player.tool_mode == TOOL_TERRAIN;

        this.BRUSHgrid.menuButton(row+0, 0, "air", () => {
            player.tool_mode = TOOL_TERRAIN;
            blocktype = BLOCK_AIR;
        }, blocktype === BLOCK_AIR && using_terrain);

        this.BRUSHgrid.menuButton(row+0, 1, "grass", () => {
            player.tool_mode = TOOL_TERRAIN;
            blocktype = BLOCK_GRASS;
        },  blocktype === BLOCK_GRASS && using_terrain);


        this.BRUSHgrid.menuButton(row+1, 0, "dirt", () => {
            player.tool_mode = TOOL_TERRAIN;
            blocktype = BLOCK_DIRT;
        },  blocktype === BLOCK_DIRT && using_terrain);

        this.BRUSHgrid.menuButton(row+1, 1, "stone", () => {
            player.tool_mode = TOOL_TERRAIN;
            blocktype = BLOCK_STONE;
        }, blocktype === BLOCK_STONE && using_terrain);


        this.BRUSHgrid.menuButton(row+2, 0, "silver", () => {
            player.tool_mode = TOOL_TERRAIN;
            blocktype = BLOCK_SILVER;
        },  blocktype === BLOCK_SILVER && using_terrain);

        this.BRUSHgrid.menuButton(row+2, 1, "gold", () => {
            player.tool_mode = TOOL_TERRAIN;
            blocktype = BLOCK_GOLD;
        },  blocktype == BLOCK_GOLD && using_terrain);


        player.block_type  = blocktype;
        player.block_width = blockspan;
        player.block_ksize = ksize;

    };

};

