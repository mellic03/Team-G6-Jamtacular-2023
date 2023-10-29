#version 300 es

layout (location = 0) in vec3 aPosition;
layout (location = 1) in vec2 aTexCoord;

out vec3 fsin_fragpos;
out vec2 fsin_texcoord;


void main()
{
    vec4 positionVec4 = vec4(aPosition.xy, 0.8, 1.0);
    positionVec4.xy = positionVec4.xy * 2.0 - 1.0;

    fsin_fragpos = positionVec4.xyz;
    fsin_texcoord = aTexCoord;

    gl_Position = positionVec4;
}


