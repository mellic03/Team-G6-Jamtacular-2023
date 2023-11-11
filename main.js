
let engine = new Engine();

engine.addSystem( new RenderSystem(),  "render"  );
engine.addSystem( new LightSystem(),   "light"   );
engine.addSystem( new Keylog(),        "keylog"  );
engine.addSystem( new TerrainSystem(), "terrain" );

engine.addSystem( new FactorySystem(), "factory" );
engine.addSystem( new BulletSystem(),  "bullet"  );
engine.addSystem( new AgentSystem(),   "agent"   );
engine.addSystem( new Player(),        "player"  );
engine.addSystem( new WeaponSystem(),  "weapon"  );
engine.addSystem( new PhysicsSystem(), "physics" );
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
    const factorySys = engine.getSystem("factory");

    factorySys.player_factory = factorySys.createFactory(0, 0, FACTORY_PLAYER);
    factorySys.player_factory.createAgent(AGENT_SOLDIER);

    const efactory = factorySys.createFactory(0, 1500, FACTORY_ENEMY);
    efactory.createAgent(AGENT_SOLDIER);

    terrain.lock();
}


let avg = 0.0;

function draw()
{
    const render = engine.getSystem("render");
    const terrain = engine.getSystem("terrain");

    const viewport_w = render.viewport_w;
    const viewport_h = render.viewport_h;


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

    // engine.getSystem("physics").grid.draw();

    avg = (164/165)*avg + (1/165)*frameRate();
    text(avg, 300, 100);
}
