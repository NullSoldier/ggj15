class InfluenceFilter extends Phaser.Filter {
  constructor(game : Phaser.Game) {
    super(game, {
    }, [
      'precision mediump float;',
      'varying vec2 vTextureCoord;',
      'varying vec4 vColor;',
      'uniform sampler2D uSampler;',

      'void main(void) {',
      '   float c = texture2D(uSampler, vTextureCoord).x;',
      '   if (c < 0.8) {',
      '     c = 0.0;',
      '   } else {',
      '     c = 1.0 - c;',
      '   }',
      '   gl_FragColor = vec4(1.0, 1.0, 1.0, c);',
      '}'
  ])
  }
}
