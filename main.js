
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


let avg = 0.0;

function draw()
{
    engine.draw();

    avg = (59/60)*avg + (1/60)*frameRate();
    text(avg, 300, 100);
}

