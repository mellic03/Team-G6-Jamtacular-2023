
let engine = new Engine();

engine.addSystem(new RenderSystem(1024, 1024));
engine.addSystem(new UISystem());


let g = new Graph();

function preload()
{
    engine.preload();
}


function setup()
{
    g.add(15, 21, 0.25);
    g.add(2, 4, 1.25);

    engine.setup();
}


function draw()
{
    engine.draw();
    
    // QOBJ.draw();
}

