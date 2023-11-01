
let engine = new Engine();


const WINDOW_W = 720 + 256;
const WINDOW_H = 720;

engine.addSystem(new RenderSystem(WINDOW_W, WINDOW_H), "render");
engine.addSystem(new Keylog(), "keylog");
engine.addSystem(new TerrainSystem(), "terrain");
engine.addSystem(new SpriteSystem(), "sprite");
engine.addSystem(new UISystem(), "ui");
engine.addSystem(new Player(), "player");

engine.addSystem(new CollectorSystem(), "collector");
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

