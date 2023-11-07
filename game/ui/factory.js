

class FactoryModal
{
    UIgrid;

    visible = false;

    constructor( x, y, w, h )
    {
        this.UIgrid = new MenuGrid(x, y, w, h, 20, 20);
    };


    reposition( x, y, w, h )
    {
        this.UIgrid = new MenuGrid(x, y, w, h, 20, 20);
    };

    show()
    {
        this.visible = true;
    };

    hide()
    {
        this.visible = false;
    };

    draw()
    {
        const terrain = engine.getSystem("terrain");
        const player = engine.getSystem("player");
        const factorySys = engine.getSystem("factory");
        const playerFactory = factorySys.player_factory;

        if (this.visible == false)
        {
            return;
        }

        rectMode(CORNERS);

        const ui = this.UIgrid;

        ui.background(100);

        ui.reset(3);
        ui.menuTitle("Factory", 1);
        ui.nextRow(3);
        ui.nextRow(7);

        ui.text_scale = 0.8;

        ui.menuLabel(0, 1, "Build");

        ui.menuButton2(0, 3, "Gatherer", () => {
            playerFactory.createAgent(AGENT_GATHERER);
        });

        ui.menuButton2(0, 4, "Guard", () => {
            playerFactory.createAgent(AGENT_GUARD);
        });

        ui.menuButton2(0, 5, "Attacker", () => {
            playerFactory.createAgent(AGENT_ATTACKER);
        });


        ui.menuButton(-1, -1, "Close", () => { this.hide(); });
    };
    
};



