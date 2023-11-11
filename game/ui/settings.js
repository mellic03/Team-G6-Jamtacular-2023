


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
        const physics = engine.getSystem("physics");
        const player = engine.getSystem("player");

        if (this.visible == false)
        {
            return;
        }

        rectMode(CORNERS);

        const ui = this.UIgrid;

        ui.background(100);

        ui.reset(3);
        ui.menuTitle("Settings", 1);
        ui.nextRow(3);
        ui.nextRow(3);

        ui.menuTitle("Lighting Quality", 1);
        ui.nextRow(6);
        ui.nextRow(6);

        ui.menuButton2(0, 1, "Low", () => {
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
    
        ui.menuButton2(0, 4, "Dev", () => {
            terrain.fidelity = 3;
            set_devmode(true);
        }, is_devmode());
    

        ui.nextRow(3);
        ui.nextRow(3);
        ui.menuTitle("Debugging", 1);
        ui.nextRow(6);
        ui.nextRow(6);
        {
            ui.menuLabel(0, 1, "Quadtree");

            ui.menuButton2(0, 3, "No", () => {
                terrain.visualize_quadtree = false;
            }, terrain.visualize_quadtree == false);

            ui.menuButton2(0, 4, "Yes", () => {
                terrain.visualize_quadtree = true;
            }, terrain.visualize_quadtree == true);
        }

        ui.nextRow(6);
        {
            ui.menuLabel(0, 1, "Pathfinding");

            ui.menuButton2(0, 3, "No", () => {
                terrain.visualize_pathfinding = false;
            }, terrain.visualize_pathfinding == false);

            ui.menuButton2(0, 4, "Yes", () => {
                terrain.visualize_pathfinding = true;
            }, terrain.visualize_pathfinding == true);
        }

        ui.nextRow(6);
        {
            ui.menuLabel(0, 1, "Collision Grid");

            ui.menuButton2(0, 3, "No", () => {
                physics.visualize_grid = false;
            }, physics.visualize_grid == false);

            ui.menuButton2(0, 4, "Yes", () => {
                physics.visualize_grid = true;
            }, physics.visualize_grid == true);
        }

        ui.nextRow(3);
        ui.nextRow(3);
        ui.menuTitle("Fun", 1);
        ui.nextRow(5);

        ui.nextRow(6);
        {
            ui.menuButton2(0, 1, "Ammo", () => {
                player.ammo = Infinity;
            });
            ui.menuButton2(0, 3, "Health", () => {
                player.ammo = Infinity;
            });
        }
    
        ui.nextRow(6);
        {
            ui.menuLabel(0, 1, "Slow Bullets");

            ui.menuButton2(0, 3, "No", () => {
                physics.visualize_grid = false;
            }, physics.visualize_grid == false);

            ui.menuButton2(0, 4, "Yes", () => {
                physics.visualize_grid = true;
            }, physics.visualize_grid == true);
        }


           
        ui.nextRow(6);
        {
            ui.menuLabel(0, 1, "Terrain Tools");

            ui.menuButton2(0, 3, "No", () => {
                player.can_terrain = false;
            }, player.can_terrain == false);

            ui.menuButton2(0, 4, "Yes", () => {
                player.can_terrain = true;
            }, player.can_terrain == true);
        }


        ui.menuButton(-1, -1, "Close", () => { this.hide(); });
    };


    

};

