


class SettingsModal
{
    UIgrid;
    name    = "Settings";
    visible = false;


    constructor( x, y, w, h )
    {
        this.UIgrid = new MenuGrid(x, y, w, h, 30, 5);
    };


    reposition( x, y, w, h )
    {
        this.UIgrid = new MenuGrid(x, y, w, h, 20, 5);
    };


    show()
    {
        this.visible = true;
    };


    hide()
    {
        this.visible = false;
    };


    draw()
    {
        const terrain = engine.getSystem("terrain");
        const bullet  = engine.getSystem("bullet");
        const physics = engine.getSystem("physics");
        const player  = engine.getSystem("player");
        const factory = engine.getSystem("factory").player_factory;

        if (this.visible == false)
        {
            return;
        }

        rectMode(CORNERS);

        const ui = this.UIgrid;
        ui.reset(3);
        ui.background(100);
        ui.padding[0] = 50;
        ui.padding[1] = 50;


        ui.nextRow(3);
        ui.menuTitle("Lighting Quality", 1);
        ui.nextRow(6);
        ui.nextRow(5);


        ui.menuButton2(0, 0, "Dev", () => {
            terrain.fidelity = 3;
            set_devmode(true);
        }, is_devmode());

        ui.menuButton2(0, 1, "Off", () => {
            terrain.fidelity = 0;
            set_devmode(false);
        }, terrain.fidelity == 0);

        ui.menuButton2(0, 2, "Med", () => {
            terrain.fidelity = 1;
            set_devmode(false);
        }, terrain.fidelity == 1);

        ui.menuButton2(0, 3, "High", () => {
            terrain.fidelity = 2;
            set_devmode(false);
        }, terrain.fidelity == 2);

        ui.menuButton2(0, 4, "HIGH", () => {
            terrain.fidelity = 4;
            set_devmode(false);
        }, terrain.fidelity == 4);


        ui.nextRow(3);
        ui.nextRow(3);
        ui.menuTitle("Visualizations", 1);
        ui.nextRow(6);
        ui.nextRow(3);
        {
            terrain.visualize_quadtree = ui.toggleButton(
                0, 0, "Quadtree", terrain.visualize_quadtree
            );

            terrain.visualize_pathfinding = ui.toggleButton(
                0, 1, "Pathfinding", terrain.visualize_pathfinding
            );

            physics.visualize_grid = ui.toggleButton(
                0, 2, "Collision Grid", physics.visualize_grid
            );
        }

        ui.nextRow(3);
        ui.nextRow(1);
        ui.menuTitle("Fun", 0);
        ui.nextRow(5);


        ui.nextRow(3);
        {
            ui.menuButton2(0, 0, "Inf. Money", () => {
                factory.monies = Infinity;
            }, factory.monies == Infinity);

            ui.menuButton2(0, 1, "Inf. Health", () => {
                player.health = Infinity;
            }, player.health == Infinity);

            ui.menuButton2(0, 2, "Inf. Ammo", () => {
                player.ammo = Infinity;
            }, player.ammo == Infinity);

        }
    
        ui.nextRow(3);
        {
            player.can_terrain = ui.toggleButton(
                0, 0, "Terrain Edit", player.can_terrain
            );

            __slow_bullets = ui.toggleButton(
                0, 1, "Slow Bullets", __slow_bullets
            );

            player.mega_shotgun = ui.toggleButton(
                0, 2, "Big Shotgun", player.mega_shotgun
            );
        }


        ui.menuButton(-2, -1, "Close", () => { this.hide(); });
    };


    

};

