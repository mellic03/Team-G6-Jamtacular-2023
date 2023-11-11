
const MODAL_SETTINGS  = 0;
const MODAL_INVENTORY = 1;
const MODAL_FACTORY   = 2;


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

        // const factory = engine.getSystem("factory");
        // factory.createFactory(FACTORY_PLAYER);
    };


    draw( engine )
    {
        const player = engine.getSystem("player");
        const keylog  = engine.getSystem("keylog");

        // Reset mouse lock, if mouse is still over UI then enable it again
        // ----------------------------------------------------------------
        keylog.unlockMouse();

        if (this.DEBUGgrid.mouseInBounds())
        {
            keylog.lockMouse();
        }
        // ----------------------------------------------------------------

        stroke(0);

        // this.draw_sector_memusage(engine);
        this.draw_game_ui(engine);

        if (player.can_terrain)
        {
            this.draw_dev_ui(engine);
        }

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


        const ui = this.UIgrid;

        ui.reset();
        ui.background(100);
        ui.text_scale = 0.7;
        ui.nextRow(2);

        ui.menuLabel(0, 0, "Monies: ", CENTER, CENTER);
        ui.menuLabel(0, 1, playerFactory.monies, LEFT, CENTER);
        ui.nextRow(2);

        ui.menuLabel(0, 0, "Health:  ",   CENTER, CENTER);
        ui.menuLabel(0, 1, player.health, LEFT,   CENTER);
        ui.nextRow(2);

        ui.menuLabel(0, 0, "Ammo:  ",   CENTER, CENTER);
        ui.menuLabel(0, 1, player.ammo, LEFT,   CENTER);
        ui.nextRow(2);
        ui.nextRow(2);


        ui.menuButton2(0, 0, "Gun", () => {
            player.tool_mode = TOOL_WEAPON;
            player.active_weapon = WEAPON_RIFLE;
        }, player.tool_mode == TOOL_WEAPON && player.active_weapon == WEAPON_RIFLE);

        ui.menuButton2(0, 1, "Gunnn", () => {
            player.tool_mode = TOOL_WEAPON;
            player.active_weapon = WEAPON_SHOTGUN;
        }, player.tool_mode == TOOL_WEAPON && player.active_weapon == WEAPON_SHOTGUN);
        ui.nextRow(2);
        ui.nextRow(2);


        ui.menuButton2(0, 0, "Inspect", () => {
            player.tool_mode = TOOL_INSPECT;
        }, player.tool_mode == TOOL_INSPECT);

        ui.menuButton2(0, 1, "Select", () => {
            player.tool_mode = TOOL_SELECT;
        }, player.tool_mode == TOOL_SELECT);
        ui.nextRow(2);


        ui.menuButton2(0, 0, "Control", () => {
            player.tool_mode = TOOL_CONTROL;
        }, player.tool_mode == TOOL_CONTROL);
        ui.nextRow(2);
        ui.nextRow(2);

        ui.menuButton2(0, 0, "Settings", () => {
            player.tool_mode = TOOL_NONE;
            this.modals[MODAL_SETTINGS].show();
        });
        ui.nextRow(2);


        ui.menuButton2(0, 0, "light A", () => {
            player.tool_mode = TOOL_LIGHT_A;
        }, player.tool_mode == TOOL_LIGHT_A);

        ui.menuButton2(0, 1, "light B", () => {
            player.tool_mode = TOOL_LIGHT_B;
        }, player.tool_mode == TOOL_LIGHT_B);
        ui.nextRow(2);

        ui.menuButton2(0, 0, "x: " + floor(player.position[0]));
        ui.menuButton2(0, 1, "y: " + floor(player.position[1]));
        ui.nextRow(2);
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



    draw_rect_ui()
    {
        const player  = engine.getSystem("player");
        const ui = this.BRUSHgrid;

        ui.menuButton2(0, 1, "Flip", () => {
            [player.rect_w, player.rect_h] = [player.rect_h, player.rect_w];
        });


        ui.nextRow(2);
        ui.menuButton2(0, 0, "Width*2", () => {
            player.rect_w *= 2;
        });
        ui.menuButton2(0, 1, "Width/2", () => {
            player.rect_w /= 2;
        });

        
        ui.nextRow(2);
        ui.menuButton2(0, 0, "Height*2", () => {
            player.rect_h *= 2;
        });
        ui.menuButton2(0, 1, "Height/2", () => {
            player.rect_h /= 2;
        });

        
        ui.nextRow(2);
        ui.menuButton2(0, 0, "+22.5", () => {
            player.rect_r += 22.5;
        });
        ui.menuButton2(0, 1, "-22.5", () => {
            player.rect_r -= 22.5;
        });
    };


    draw_circle_ui()
    {
        const player  = engine.getSystem("player");
        const ui = this.BRUSHgrid;

        ui.menuButton2(0, 0, "Radius*2", () => {
            player.block_ksize *= 2;
        });
        ui.menuButton2(0, 1, "Radius/2", () => {
            player.block_ksize /= 2;
        });

        ui.nextRow(2);

        ui.menuButton2(0, 1, "Blocksize*2", () => {
            player.block_width /= 2;
            player.block_ksize *= 2;
        });

        ui.menuButton2(0, 0, "Blocksize/2", () => {
            player.block_width *= 2;
            player.block_ksize /= 2;
        });
    };


    draw_dev_ui( engine )
    {
        const render  = engine.getSystem("render");
        const terrain = engine.getSystem("terrain");
        const player  = engine.getSystem("player");

        const ui = this.BRUSHgrid;
        ui.reset();
        ui.text_scale = 0.7;

        ui.nextRow(2);
        ui.menuButton2(0, 0, "Rect", () => {
            player.tool_mode = TOOL_RECT
        }, player.tool_mode === TOOL_RECT);

        ui.menuButton2(0, 1, "Circle", () => {
            player.tool_mode = TOOL_TERRAIN
        }, player.tool_mode === TOOL_TERRAIN);

        ui.nextRow(2);

        if (player.tool_mode == TOOL_RECT)
        {
            this.draw_rect_ui();
        }

        else if (player.tool_mode == TOOL_TERRAIN)
        {
            this.draw_circle_ui();
        }


        let using_terrain = player.tool_mode === TOOL_TERRAIN || player.tool_mode === TOOL_RECT;

        ui.menuButton(8, 0, "air", () => {
            player.block_type = BLOCK_AIR;
        }, player.block_type === BLOCK_AIR && using_terrain);

        ui.menuButton(8, 1, "grass", () => {
            player.block_type = BLOCK_GRASS;
        },  player.block_type === BLOCK_GRASS && using_terrain);


        ui.menuButton(9, 0, "dirt", () => {
            player.block_type = BLOCK_DIRT;
        },  player.block_type === BLOCK_DIRT && using_terrain);

        ui.menuButton(9, 1, "stone", () => {
            player.block_type = BLOCK_STONE;
        }, player.block_type === BLOCK_STONE && using_terrain);


        ui.menuButton(10, 0, "silver", () => {
            player.block_type = BLOCK_SILVER;
        },  player.block_type === BLOCK_SILVER && using_terrain);

        ui.menuButton(10, 1, "gold", () => {
            player.block_type = BLOCK_GOLD;
        },  player.block_type == BLOCK_GOLD && using_terrain);


        ui.menuButton(11, 0, "bedrock", () => {
            player.block_type = BLOCK_BEDROCK;
        },  player.block_type == BLOCK_BEDROCK && using_terrain);


        ui.menuButton(13, 0, "Save", () => {
            terrain.toFile("map.txt");
        });

    };

};

