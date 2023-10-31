

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
        const render = engine.getSystem("render");
        const factory = engine.getSystem("factory");
        const terrain = engine.getSystem("terrain");
        // const player = engine.getSystem("player");

        this.UIgrid.background(100);

        const x = render.view_pos[0];
        const y = render.view_pos[1];
        this.UIgrid.menuButton(1, 0, int(x) + ", " + int(y));

        this.UIgrid.menuButton(0, 0, "Test", testcallback);
        this.UIgrid.menuButton(0, 1, "Build");
        this.UIgrid.menuButton(5, 2, "test");
        this.UIgrid.menuButton(6, 1, "test");
        this.UIgrid.menuButton(6, 2, "test");
    };
};

