

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
        const agentSys = engine.getSystem("agent");
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

        ui.text_scale = 0.8;

        ui.menuTitle("Build", 1);
        ui.nextRow(7);

        ui.menuButton2(0, 3, "Gatherer", () => {
            agentSys.createAgent(AGENT_GATHERER, playerFactory);
        });

        ui.menuButton2(0, 4, "Guard", () => {
            agentSys.createAgent(AGENT_GUARD, playerFactory);
        });

        ui.menuButton2(0, 5, "Attacker", () => {
            agentSys.createAgent(AGENT_ATTACKER, playerFactory);
        });

        ui.menuButton2(0, 6, "Good H", () => {
            agentSys.createAgent(AGENT_REE, playerFactory);
        });
        ui.menuButton2(0, 7, "Bad H", () => {
            agentSys.createAgent(AGENT_REE, null);
        });



        ui.nextRow(3);
        ui.menuTitle("Buy", 1);
        ui.nextRow(7);

        ui.menuButton2(0, 3, "Ammo", () => {
            if (playerFactory.monies >= 10)
            {
                playerFactory.monies -= 10;
                player.ammo += 10;
            }
        });

        ui.menuButton(-1, -1, "Close", () => { this.hide(); });
    };
    
};



