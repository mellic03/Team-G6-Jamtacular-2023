
let engine = new Engine();

engine.addSystem( new RenderSystem(),  "render"  );
engine.addSystem( new Keylog(),        "keylog"  );
engine.addSystem( new TerrainSystem(), "terrain" );

engine.addSystem( new CollectorSystem(), "collector" );
engine.addSystem( new FactorySystem(),   "factory"   );
engine.addSystem( new Player(),          "player"    );
engine.addSystem( new UISystem(),        "ui"        );


function preload()
{
    engine.preload();
}


function setup()
{
    engine.setup();
}


function draw()
{
    engine.draw();
}

