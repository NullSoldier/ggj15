class AmbientLightFilter extends Phaser.Filter {
  constructor(game : Phaser.Game) {
    super(game, {
      uColor: {type: '4fv', value: [0, 0, 0, 0]}
    }, [
      'precision mediump float;',
      'varying vec2 vTextureCoord;',
      'varying vec4 vColor;',
      'uniform sampler2D uSampler;',
      'uniform vec4 uColor;',

      'float hardLight(float b, float a) {',
      '  return b < 0.5 ? (2.0 * a * b) : (1.0 - 2.0 * (1.0 - a) * (1.0 - b));',
      '}',

      'void main(void) {',
      '  vec4 c = texture2D(uSampler, vTextureCoord);',
      '  gl_FragColor = mix(c, vec4(',
      '    hardLight(uColor.r, c.r),',
      '    hardLight(uColor.g, c.g),',
      '    hardLight(uColor.b, c.b),',
      '    c.a), uColor.a);',
      '}'
    ])
  }

  setColor(r : number, g : number, b : number, a : number) : void {
    this.uniforms.uColor.value = [r, g, b, a]
  }
}
