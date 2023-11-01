

function testcallback()
{
    console.log("WOW!");
}




class UISystem
{
    UIgrid;

    preload( engine )
    {

    };

    setup( engine )
    {
        const render = engine.getSystem("render");
        const keylog = engine.getSystem("keylog");

        this.UIgrid = new ButtonGrid(
            render.res_min, render.res_x-render.res_min, render.res_y, 20, 2, keylog
        );

    };

    draw( engine )
    {
        const render  = engine.getSystem("render");
        const factory = engine.getSystem("factory");
        const terrain = engine.getSystem("terrain");
        const keylog  = engine.getSystem("keylog");


        // Reset mouse lock, if mouse is still over UI then enable it again
        // ----------------------------------------------------------------
        keylog.unlockMouse();

        if (this.UIgrid.mouseInBounds())
        {
            keylog.lockMouse();
        }
        // ----------------------------------------------------------------


        this.UIgrid.background(100);

        const x = render.view_pos[0];
        const y = render.view_pos[1];
        this.UIgrid.menuButton(1, 0, int(x) + ", " + int(y));

        this.UIgrid.menuButton(0, 0, "Test", testcallback);
        this.UIgrid.menuButton(0, 1, "Build");
        this.UIgrid.menuButton(10, 0, "Save", () => {
            terrain.toFile("terrain.txt");
        });

    };


};

