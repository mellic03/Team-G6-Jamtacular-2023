
function approxEqual( a, b, epsilon )
{
    if (abs(a - b) <= epsilon)
    {
        return true;
    }
    else
    {
        return false;
    }
}



const OFFLINE_WIDTH  = 512;
const OFFLINE_HEIGHT = 512;



class RenderSystem
{
    offline_context;
    offline_contexts = [  ];

    res_x;
    res_y;

    viewport_x;
    viewport_y;
    viewport_left;

    view_pos = [ 0.0, 0.0 ];

    constructor( res_x=512, res_y=512 )
    {
        this.onWindowResize(res_x, res_y);
    };


    onWindowResize( res_x, res_y )
    {
        this.res_x = res_x;
        this.res_y = res_y;
        this.res_min = Math.min(res_x, res_y);
        this.res_max = Math.max(res_x, res_y);
    };


    offlineContext( idx )
    {
        return this.offline_contexts[idx];
    }


    preload( engine )
    {
        this.offline_contexts[0] = createGraphics(OFFLINE_WIDTH, OFFLINE_HEIGHT, WEBGL);
        this.offline_contexts[0].textureWrap(CLAMP);
        this.offline_contexts[1] = createGraphics(OFFLINE_WIDTH, OFFLINE_HEIGHT, WEBGL);
        this.offline_contexts[1].textureWrap(CLAMP);
    };


    setup( engine )
    {
        createCanvas(this.res_x, this.res_y);
        frameRate(165);
        windowResized();
    };


    draw( engine )
    {
        background(0);
    };


    translate( x, y )
    {
        this.view_pos[0] += x;
        this.view_pos[1] += y;
    };


    setView( x, y )
    {
        this.view_pos[0] = x;
        this.view_pos[1] = y;
    };


    world_to_screen( world_x, world_y )
    {
        let screen_x = (world_x - this.view_pos[0]) * (this.viewport_w / TERRAIN_VIEW_WIDTH_PIXELS);
        let screen_y = (world_y - this.view_pos[1]) * (this.viewport_h / TERRAIN_VIEW_HEIGHT_PIXELS);

        screen_x += this.viewport_w/2;
        screen_y += this.viewport_h/2;

        return [ screen_x, screen_y ];
    };
    

    screen_to_world( screen_x, screen_y )
    {
        let world_x = this.view_pos[0] + screen_x - this.viewport_w/2;
        let world_y = this.view_pos[1] + screen_y - this.viewport_h/2;

        world_x = this.view_pos[0] + TERRAIN_VIEW_WIDTH_PIXELS  * ((world_x - this.view_pos[0]) / this.viewport_w);
        world_y = this.view_pos[1] + TERRAIN_VIEW_HEIGHT_PIXELS * ((world_y - this.view_pos[1]) / this.viewport_h);

        return [ world_x, world_y ];
    }
};




function windowResized()
{
    const render = engine.getSystem("render");
    const UIsys  = engine.getSystem("ui");

    if (windowWidth * (1.0 - UIsys.proportion_ui) < windowHeight)
    {
        render.res_x = windowWidth;
        render.res_y = windowWidth - (windowWidth * UIsys.proportion_ui);
    }

    else
    {
        render.res_x = windowHeight + windowHeight * UIsys.proportion_ui;
        render.res_y = windowHeight;
    }

    resizeCanvas(render.res_x, render.res_y);

    render.viewport_left = render.res_x * (1.0 - UIsys.proportion_ui);
    render.viewport_w = render.res_x * (1.0 - UIsys.proportion_ui);
    render.viewport_h = render.res_y;

    UIsys.onWindowResize(engine);
}
