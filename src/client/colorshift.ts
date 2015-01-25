class ColorShiftFilter extends PIXI.AlphaMaskFilter {
  constructor(mask : PIXI.Texture, game : Phaser.Game) {
    super(mask)
    this.uniforms['uColor'] = {type: '4fv', value: [0, 0, 0, 0]}
    this.fragmentSrc = [
      'precision mediump float;',
      'varying vec2 vTextureCoord;',
      'varying vec4 vColor;',
      'uniform sampler2D uSampler;',
      'uniform vec4 uColor;',

      'uniform sampler2D mask;',
      'uniform vec4 dimensions;',
      'uniform vec2 mapDimensions;',

      'void main(void) {',
      //'  vec2 maskCoords = vTextureCoord.xy;',
      //'  maskCoords += dimensions.zw / dimensions.xy;',
      //'  maskCoords.y *= -1.0;',
      //'  maskCoords.y += 1.0;',
      //'  maskCoords *= dimensions.xy / mapDimensions;',

      '  vec4 c = texture2D(uSampler, vTextureCoord);',
      //'  vec4 d = texture2D(mask, maskCoords);',

      '  gl_FragColor = c;',
      //'  gl_FragColor = c + d;',
      //'  gl_FragColor = d;',
      //'  gl_FragColor = texture2D(uSampler, vTextureCoord);',
      '}'
    ]
  }

  setColor(r : number, g : number, b : number, a : number) : void {
    //this.uniforms.uColor.value = [r, g, b, a]
  }
}
