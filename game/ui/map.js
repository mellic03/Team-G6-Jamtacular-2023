



class MapModal
{
    UIgrid;
    name    = "Map";
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
        if (this.visible == false)
        {
            return;
        }

        const terrain = engine.getSystem("terrain");

        const ui = this.UIgrid;
        ui.background(100);

        ui.reset(3);
        ui.menuTitle("", 1);
        ui.nextRow(3);

        ui.menuTitle("Map", 1);
        ui.nextRow(6);

        ui.menuButton2(0, 1, "Save", () => {
            terrain.toFile("map.txt");
        });

        ui.nextRow(4);


        ui.menuButton(-1, -1, "Close", () => { this.hide(); });
    };

}
