#version 300 es

precision highp float;

out vec4 fsout_frag_color;

in vec3 fsin_fragpos;
in vec2 fsin_texcoord;


uniform vec2 un_mouse;
uniform vec2 un_view_pos;

uniform sampler2D un_quadtree;
uniform float un_quadtree_max_span;
uniform float un_quadtree_min_span;


// Trace direct illumination from light sources
vec3 trace_direct( vec2 ray_pos )
{
    vec3 result = vec3(0.0);

    return result;
}


struct QuadNode
{
    float blocktype, children_id, dummy1, dummy2;
};



QuadNode get_quadnode( vec2 uv )
{
    QuadNode node;


    return node;
}


vec3 render_quadtree( vec2 uv )
{
    vec3 color = vec3(0.0);

    return color;
}




void main()
{
    vec2 uv = fsin_texcoord.xy;

    // vec2 mouse = un_mouse / 1024.0;
    // mouse.y = 1.0 - mouse.y;

    // float dist = distance(uv, mouse);
    // dist = (1.0 - dist) - 0.8;

    vec3 color = texture(un_quadtree, uv).rgb;
    // color.xy += uv;

    fsout_frag_color = vec4(color, 1.0);
}