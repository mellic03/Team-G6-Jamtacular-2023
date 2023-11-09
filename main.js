
let engine = new Engine();

engine.addSystem( new RenderSystem(),  "render"  );
engine.addSystem( new LightSystem(),   "light"   );
engine.addSystem( new Keylog(),        "keylog"  );
engine.addSystem( new TerrainSystem(), "terrain" );

engine.addSystem( new AgentSystem(),   "agent"   );
engine.addSystem( new BulletSystem(),  "bullet"  );
engine.addSystem( new FactorySystem(), "factory" );
engine.addSystem( new Player(),        "player"  );
engine.addSystem( new PhysicsSystem(), "physics" );
engine.addSystem( new UISystem(),      "ui"      );


function preload()
{
    engine.preload();
}


function setup()
{
    engine.setup();
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

    terrain.unlock(...render.view_pos, viewport_w, viewport_h);
    engine.draw();
    terrain.lock();


    avg = (164/165)*avg + (1/165)*frameRate();
    text(avg, 300, 100);
}
