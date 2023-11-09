
const MODAL_SETTINGS  = 0;
const MODAL_INVENTORY = 1;
const MODAL_FACTORY   = 2;
const MODAL_MAP       = 3;


class UISystem
{
    UIgrid;

    DEBUGgrid;
    BRUSHgrid;

    modals = [  ];

    proportion_ui = 0.2;

    constructor()
    {
        this.modals.push(new SettingsModal(1, 1, 1, 1));
        this.modals.push(new InventoryModal(1, 1, 1, 1));
        this.modals.push(new FactoryModal(1, 1, 1, 1));
        this.modals.push(new MapModal(1, 1, 1, 1));
    }

    onWindowResize( engine )
    {
        const render = engine.getSystem("render");
        const keylog = engine.getSystem("keylog");

        const WIN_H = render.res_y;

        const UI_LEFT  = render.viewport_left;
        const UI_WIDTH = render.res_x - render.viewport_left;

        this.UIgrid = new MenuGrid(
            UI_LEFT, 0, UI_WIDTH, WIN_H, 30, 2, keylog
        );

        this.DEBUGgrid = new MenuGrid(
            UI_LEFT, 0, UI_WIDTH, WIN_H, 30, 2, keylog
        );

        this.BRUSHgrid = new MenuGrid(
            UI_LEFT, WIN_H/2, UI_WIDTH, WIN_H/2, 15, 2, keylog
        );

        for (let modal of this.modals)
        {
            modal.reposition(render.viewport_w/2 - UI_WIDTH, render.res_y/2 - UI_WIDTH, 2*UI_WIDTH, WIN_H/2);
        }
    
    };


    preload( engine )
    {

    };


    setup( engine )
    {
        const render = engine.getSystem("render");

        this.onWindowResize(engine);

        const factory = engine.getSystem("factory");
        factory.createFactory(FACTORY_PLAYER);

    };


    draw( engine )
    {
        const keylog  = engine.getSystem("keylog");

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

        for (let modal of this.modals)
        {
            modal.draw();
        }
    };


    draw_game_ui( engine )
    {
        const terrain = engine.getSystem("terrain");
        const player = engine.getSystem("player");
        const factorySys = engine.getSystem("factory");
        const playerFactory = factorySys.player_factory;

        this.UIgrid.background(100);


        this.UIgrid.menuButton(1, 0, "Heath: " + player.health);

        let row = 2;
        this.UIgrid.menuButton(row+0, 0, "$" + playerFactory.monies);
        this.UIgrid.menuButton(row+0, 1, "Ammo: " + player.ammo);
        this.UIgrid.text_scale = 0.8;

        this.UIgrid.menuButton(row+1, 0, "Gun", () => {
            player.tool_mode = TOOL_WEAPON;
            player.weapon_spread = 0.15;
            player.weapon_cooldown = 500;
        }, player.tool_mode == TOOL_WEAPON && player.weapon_spread == 0.15);

        this.UIgrid.menuButton(row+1, 1, "Gunnn", () => {
            player.tool_mode = TOOL_WEAPON;
            player.weapon_spread = 0.3;
            player.weapon_cooldown = 50;
        }, player.tool_mode == TOOL_WEAPON && player.weapon_spread == 0.3);



        this.UIgrid.menuButton(row+2, 0, "Inspect", () => {
            player.tool_mode = TOOL_INSPECT;
        }, player.tool_mode == TOOL_INSPECT);

        this.UIgrid.menuButton(row+2, 1, "Select", () => {
            player.tool_mode = TOOL_SELECT;
        }, player.tool_mode == TOOL_SELECT);



        this.UIgrid.menuButton(row+6, 0, "Map", () => {
            player.tool_mode = TOOL_NONE;
            this.modals[MODAL_MAP].show();
        });

        this.UIgrid.menuButton(row+6, 1, "Settings", () => {
            player.tool_mode = TOOL_NONE;
            this.modals[MODAL_SETTINGS].show();
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

        let row = 4;

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


        row = 8;

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


        this.BRUSHgrid.menuButton(row+3, 0, "bedrock", () => {
            player.tool_mode = TOOL_TERRAIN;
            blocktype = BLOCK_BEDROCK;
        },  blocktype == BLOCK_BEDROCK && using_terrain);


        player.block_type  = blocktype;
        player.block_width = blockspan;
        player.block_ksize = ksize;

    };

};

