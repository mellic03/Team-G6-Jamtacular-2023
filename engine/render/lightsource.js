
class Pointlight
{
    position  = [0, 0];
    diffuse   = [0, 1, 0];

    constant  = 0.0;
    linear    = 2.0;
    quadratic = 8.0;

    s_constant  = 0.0;
    s_linear    = 1.0;
    s_quadratic = 20.0;

    radius = QUADTREE_SPAN;

    constructor( r, g, b )
    {
        this.diffuse = [r, g, b];
    };

    setUniforms( name, program )
    {
        program.setUniform( name + ".position",  this.position  );
        program.setUniform( name + ".diffuse",   this.diffuse   );

        program.setUniform( name + ".constant",  this.constant  );
        program.setUniform( name + ".linear",    this.linear    );
        program.setUniform( name + ".quadratic", this.quadratic );

        program.setUniform( name + ".s_constant",  this.s_constant  );
        program.setUniform( name + ".s_linear",    this.s_linear    );
        program.setUniform( name + ".s_quadratic", this.s_quadratic );

        program.setUniform( name + ".radius",     this.radius     );
    };


    copy( light )
    {
        this.position  = vec2_valueof(light.position);

        this.diffuse[0] = valueof(light.diffuse[0]);
        this.diffuse[1] = valueof(light.diffuse[1]);
        this.diffuse[2] = valueof(light.diffuse[2]);

        this.constant  = valueof(light.constant);
        this.linear    = valueof(light.linear);
        this.quadratic = valueof(light.quadratic);

        this.s_constant  = valueof(light.s_constant);
        this.s_linear    = valueof(light.s_linear);
        this.s_quadratic = valueof(light.s_quadratic);

        this.radius = valueof(light.radius);
    }

};


const NUM_POINTLIGHTS = 4;

class LightSystem
{
    pointlights = [  ];

    constructor()
    {
        for (let i=0; i<NUM_POINTLIGHTS; i++)
        {
            this.pointlights.push(new Pointlight(0, 0, 0));
        }

        this.pointlights[0].diffuse  = [1, 2, 2];
        this.pointlights[0].position = [-100, -100];

        this.pointlights[3].diffuse  = [2, 2, 1];
        this.pointlights[3].position = [+100, -100];
    };


    preload( engine )
    {

    };


    setup( engine )
    {

    };


    draw( engine )
    {

    };


    setDefault( light )
    {

    };


    getPointlight( idx )
    {
        return this.pointlights[idx];
    };


    setUniforms( program )
    {
        for (let i=0; i<this.pointlights.length; i++)
        {
            this.pointlights[i].setUniforms("un_pointlight_" + i, program);
        }
    };

};

