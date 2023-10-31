
let engine = new Engine();

engine.addSystem(new RenderSystem(1280, 1024), "render");
engine.addSystem(new Keylog(), "keylog");
engine.addSystem(new TerrainSystem(), "terrain");
engine.addSystem(new UISystem(), "ui");
engine.addSystem(new Player(), "player");
engine.addSystem(new FactorySystem(), "factory");


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

