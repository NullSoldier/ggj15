class InfluenceFilter extends Phaser.Filter {
  constructor(game : Phaser.Game) {
    super(game, {
      uColor: {type: '3fv', value: [0, 0, 0, 0]}
    }, [
      'precision mediump float;',
      'varying vec2 vTextureCoord;',
      'varying vec4 vColor;',
      'uniform sampler2D uSampler;',
      'uniform vec3 uColor;',

      'void main(void) {',
      '  float c = texture2D(uSampler, vTextureCoord).x;',
      '  if (c < 0.8) {',
      '    c = 0.0;',
      '  } else {',
      '    c = (1.0 - c) * 3.0;',
      '  }',
      '  gl_FragColor = vec4(uColor.r, uColor.g, uColor.b, c);',
      '}'
    ])
  }

  setColor(r : number, g : number, b : number) : void {
    this.uniforms.uColor.value = [r, g, b]
  }
}
