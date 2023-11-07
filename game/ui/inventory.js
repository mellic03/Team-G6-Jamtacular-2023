

class InventoryModal
{
    UIgrid;

    visible = false;

    constructor( x, y, w, h )
    {
        this.UIgrid = new MenuGrid(x, y, w, h, 20, 20);
    };


    reposition( x, y, w, h )
    {
        this.UIgrid = new MenuGrid(x, y, w, h, 20, 20);
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
        ui.menuTitle("Inventory", 1);
        ui.nextRow();
        ui.nextRow(5);

        ui.menuButton(0, 1, "A", () => {
        });

        ui.menuButton(0, 2, "B", () => {
        });

        ui.menuButton(0, 3, "C", () => {
        });


        ui.menuButton(-1, -1, "Close", () => { this.hide(); });

    };
    
};


