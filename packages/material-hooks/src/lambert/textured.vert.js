import glsl from 'glslify'

export default glsl`
  precision <<FLOAT_PRECISION>> float;

  uniform mat4 viewMatrix;
  uniform mat4 modelMatrix;
  uniform mat4 projectionMatrix;

  const int NUM_POINT_LIGHTS = <<NUM_POINT_LIGHTS>>;
  uniform vec3 pointLd[NUM_POINT_LIGHTS];
  uniform vec3 pointLp[NUM_POINT_LIGHTS];

  uniform sampler2D mapKd;
  uniform vec2 uVScale;
  uniform vec3 uKa;
  uniform float uNa;

  attribute vec3 position;
  attribute vec3 normal;
  attribute vec2 uv;

  varying vec3 vColor;

  #pragma glslify: transpose = require('glsl-transpose')
  #pragma glslify: inverse = require('glsl-inverse')
  #pragma glslify: toLinear = require('glsl-gamma/in')

  vec4 textureLinear(sampler2D uTex, vec2 uv) {
    return toLinear(texture2D(uTex, uv));
  }

  void main(void) {
    vec3 kd = textureLinear(mapKd, uv * uVScale).rgb;

    mat4 modelViewMatrix = viewMatrix * modelMatrix;
    vec4 viewModelPosition = modelViewMatrix * vec4(position, 1.0);
  
    mat3 normalMatrix = transpose(inverse(mat3(modelViewMatrix)));
    vec3 N = normalize(normalMatrix * normal);

    vec3 color = vec3(0.0);
    vec3 light = vec3(0.0);
    vec4 lightPosition = vec4(0.0);
    vec3 ambient = kd * uKa * uNa;

    for (int i = 0; i < NUM_POINT_LIGHTS; i++) {
      lightPosition = viewMatrix * vec4(pointLp[i], 1.0);
      light = -normalize(viewModelPosition.xyz - lightPosition.xyz);
      color += (pointLd[i] * kd * clamp(dot(N, light), 0.0, 1.0));
    }

    vColor = color + ambient;

    gl_Position = projectionMatrix * viewModelPosition;
  }
`
