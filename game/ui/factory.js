

class FactoryModal
{
    UIgrid;
    name    = "Factory";
    visible = false;
    factory = undefined;

    constructor( x, y, w, h )
    {
        this.UIgrid = new MenuGrid(x, y, w, h, 20, 20);
    };


    reposition( x, y, w, h )
    {
        this.UIgrid = new MenuGrid(x, y, w, h, 20, 20);
    };

    show( factory )
    {
        this.factory = factory;
        this.visible = true;
    };

    hide()
    {
        this.factory = undefined;
        this.visible = false;
    };

    draw( )
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

        const factory = this.factory;
        const ui = this.UIgrid;

        ui.background(100);

        ui.reset(3);
        ui.menuTitle("Factory", 1);
        ui.nextRow(3);
        ui.nextRow(3);

        ui.text_scale = 0.7;

        ui.menuTitle("Build", 1);
        ui.nextRow(6);
        ui.nextRow(6);

        ui.menuButton2(0, 1, "Gatherer", () => {
            factory.createAgent(AGENT_GATHERER);
        });

        ui.menuButton2(0, 2, "Guard", () => {
            factory.createAgent(AGENT_GUARD);
        });

        ui.menuButton2(0, 3, "Security", () => {
            factory.createAgent(AGENT_SECURITY);
        });

        ui.menuButton2(0, 4, "Human?", () => {
            factory.createAgent(AGENT_REE);
        });

        ui.nextRow(6);

        ui.menuButton2(0, 1, "Ammo x10", () => {
            if (factory.monies >= 10)
            {
                factory.monies -= 10;
                player.ammo += 10;
            }
        });

        ui.menuButton2(0, 2, "Ammo x50", () => {
            if (factory.monies >= 50)
            {
                factory.monies -= 50;
                player.ammo += 50;
            }
        });

        ui.menuButton2(0, 3, "Ammo x100", () => {
            if (factory.monies >= 100)
            {
                factory.monies -= 100;
                player.ammo += 100;
            }
        });

        ui.menuButton(-1, -1, "Close", () => { this.hide(); });
    };
    
};



