
let engine = new Engine();

engine.addSystem( new RenderSystem(),  "render"  );
engine.addSystem( new LightSystem(),   "light"   );
engine.addSystem( new Keylog(),        "keylog"  );
engine.addSystem( new TerrainSystem(), "terrain" );

engine.addSystem( new FactorySystem(), "factory" );
engine.addSystem( new BulletSystem(),  "bullet"  );
engine.addSystem( new AgentSystem(),   "agent"   );
engine.addSystem( new WeaponSystem(),  "weapon"  );
engine.addSystem( new PhysicsSystem(), "physics" );
engine.addSystem( new Player(),        "player"  );
engine.addSystem( new UISystem(),      "ui"      );
// engine.addSystem( new AudioSystem(),   "audio"   );


function preload()
{
    engine.preload();
}


function setup()
{
    engine.setup();

    const terrain = engine.getSystem("terrain");
    terrain.unlockAll();
    enemy_factory_init();
    terrain.lock();
}


let avg = 0.0;

function draw()
{
    const render = engine.getSystem("render");
    const terrain = engine.getSystem("terrain");

    const viewport_w = render.viewport_w;
    const viewport_h = render.viewport_h;


    if (engine.getSystem("factory").player_factory.health <= 0)
    {
        rectMode(CORNERS);
        fill(0, 0, 0, 2);
        rect(0, 0, render.res_x, render.res_y);
        
        textAlign(LEFT, CENTER);
        textSize(64);
        stroke(255);
        text("DEAD 😩 🪦 😭", render.res_x/2, render.res_y/2);

        return;
    }


    engine.getSystem("bullet").addBodies();
    engine.getSystem("agent").addBodies();
    engine.getSystem("player").addBodies();
    engine.getSystem("factory").addBodies();

    if (is_devmode())
    {
        terrain.unlockAll();
    }

    else
    {
        terrain.unlock(...render.view_pos, viewport_w, viewport_h);
    }

    engine.draw();
    terrain.lock();

    textAlign(LEFT, TOP);
    avg = (164/165)*avg + (1/165)*frameRate();
    text(int(avg), 0, 0);
}
