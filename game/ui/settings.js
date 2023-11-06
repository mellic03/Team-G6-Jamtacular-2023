


class SettingsModal
{
    UIgrid;

    visible = false;

    constructor( x, y, w, h )
    {
        this.UIgrid = new ButtonGrid(x, y, w, h, 30, 5);
    };


    reposition( x, y, w, h )
    {
        this.UIgrid = new ButtonGrid(x, y, w, h, 20, 5);
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

        ui.menuTitle("Lighting Quality", 1);
        ui.nextRow(6);

        ui.menuButton2(0, 1, "Low", () => {
            terrain.fidelity = 0;
        }, terrain.fidelity == 0);

        ui.menuButton2(0, 2, "Med", () => {
            terrain.fidelity = 1;
        }, terrain.fidelity == 1);

        ui.menuButton2(0, 3, "High", () => {
            terrain.fidelity = 2;
        }, terrain.fidelity == 2);
    
        ui.menuButton2(0, 4, "Blazed", () => {
            terrain.fidelity = 3;
        }, terrain.fidelity == 3);
    

        ui.nextRow(3);
        ui.menuTitle("Debugging", 1);

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


        ui.menuButton(-1, -1, "Close", () => { this.hide(); });

    };

};

