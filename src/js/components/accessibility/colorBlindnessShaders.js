// Matrices de corrección de color para distintos tipos de daltonismo

const colorBlindnessShaders3 = {
  deuteranomaly: ` 
  void main() {
    vec4 color = texture2D(uTexture0, vTextureCoords);
    mat4 colorMatrix = mat4(
      1.0,  0.0,   0.0,  0.0,  // R
      0.0,  0.65,  0.35, 0.0,  // G (más puro)
      0.0,  0.35,  0.65, 0.0,  // B (menos mezcla con verde)
      0.0,  0.0,   0.0,  1.0
    );
    gl_FragColor = colorMatrix * color;
  }
`,
  protanomaly: `
void main() {
  vec4 color = texture2D(uTexture0, vTextureCoords);
  mat4 colorMatrix = mat4(
  0.80, 0.20, 0.00, 0.0,  // R: mezcla rojo con verde
  0.30, 0.70, 0.00, 0.0,  // G: leve compensación
  0.00, 0.10, 0.90, 0.0,  // B: casi intacto
  0.00, 0.00, 0.00, 1.0
  );
  gl_FragColor = colorMatrix * color;
}
`,
  tritanomaly: `
void main() {
  vec4 color = texture2D(uTexture0, vTextureCoords);
  mat4 colorMatrix = mat4(
    1.00,  0.00,  0.00, 0.0,  // R: sin cambios
    0.00,  1.05, -0.05, 0.0,  // G: refuerza verde, resta azul
    0.00, -0.10,  1.10, 0.0,  // B: refuerza azul, resta verde
    0.00,  0.00,  0.00, 1.0
  );
  gl_FragColor = colorMatrix * color;
}
`

};
const colorBlindnessShaders2 = {
  deuteranomaly: `
  void main() {
    vec4 color = texture2D(uTexture0, vTextureCoords);

    // Matriz ajustada para mantener equilibrio entre beige, amarillo y verde
    mat4 colorMatrix = mat4(
      1.05, -0.05,  0.0,  0.0,  // Rojo reforzado, verde reducido
      0.0,   0.65,  0.35, 0.0,  // Verde compensado con azul
      0.0,   0.10,  0.90, 0.0,  // Azul sin sobresaturación
      0.0,   0.0,   0.0,  1.0
    );

    vec3 filtered = (colorMatrix * color).rgb;

    // Boost de saturación leve
    float avg = (filtered.r + filtered.g + filtered.b) / 3.0;
    vec3 saturated = mix(vec3(avg), filtered, 1.15); // boost leve

    // Gamma solo sobre luces altas
    vec3 gammaCorrected = mix(
      saturated,
      pow(saturated, vec3(1.15)),
      smoothstep(0.7, 1.0, avg)  // Solo afecta tonos muy claros
    );

    gl_FragColor = vec4(gammaCorrected, color.a);
  }
`,
  protanomaly: `
    void main() {
      vec4 color = texture2D(uTexture0, vTextureCoords);
      mat4 colorMatrix = mat4(
        0.817, 0.183, 0.0, 0.0,
        0.333, 0.667, 0.0, 0.0,
        0.0, 0.125, 0.875, 0.0,
        0.0, 0.0, 0.0, 1.0
      );
      gl_FragColor = colorMatrix * color;
    }
  `,
  tritanomaly: `
    void main() {
      vec4 color = texture2D(uTexture0, vTextureCoords);
      mat4 colorMatrix = mat4(
        0.967, 0.033, 0.0, 0.0,
        0.0, 0.733, 0.267, 0.0,
        0.0, 0.183, 0.817, 0.0,
        0.0, 0.0, 0.0, 1.0
      );
      gl_FragColor = colorMatrix * color;
    }
  `
};
const colorBlindnessShaders1 = {
  deuteranomaly: `
    void main() {
      vec4 color = texture2D(uTexture0, vTextureCoords);
      mat4 colorMatrix = mat4(
        1.0, 0.0, 0.0, 0.0,
        0.0, 0.74, 0.26, 0.0,
        0.0, 0.26, 0.74, 0.0,
        0.0, 0.0, 0.0, 1.0
      );
      gl_FragColor = colorMatrix * color;
    }
  `,
  protanomaly: `
    void main() {
      vec4 color = texture2D(uTexture0, vTextureCoords);
      mat4 colorMatrix = mat4(
        0.817, 0.183, 0.0, 0.0,
        0.333, 0.667, 0.0, 0.0,
        0.0, 0.125, 0.875, 0.0,
        0.0, 0.0, 0.0, 1.0
      );
      gl_FragColor = colorMatrix * color;
    }
  `,
  tritanomaly: `
    void main() {
      vec4 color = texture2D(uTexture0, vTextureCoords);
      mat4 colorMatrix = mat4(
        0.967, 0.033, 0.0, 0.0,
        0.0, 0.733, 0.267, 0.0,
        0.0, 0.183, 0.817, 0.0,
        0.0, 0.0, 0.0, 1.0
      );
      gl_FragColor = colorMatrix * color;
    }
  `
};
const colorBlindnessShaders = {
  deuteranomaly: ` 
  void main() {
    vec4 color = texture2D(uTexture0, vTextureCoords);
    mat4 colorMatrix = mat4(
      1.0,  0.0,   0.0,  0.0,  // R
      0.0,  0.55,  0.45, 0.0,  // G (más puro)
      0.0,  0.40,  0.60, 0.0,  // B (menos mezcla con verde)
      0.0,  0.0,   0.0,  1.0
    );
    gl_FragColor = colorMatrix * color;
  }
`,
  protanomaly: `
void main() {
  vec4 color = texture2D(uTexture0, vTextureCoords);
  mat4 colorMatrix = mat4(
    0.817, 0.183, 0.0,   0.0, // R
    0.333, 0.667, 0.0,   0.0, // G
    0.0,   0.125, 0.875, 0.0, // B compensado
    0.0,   0.0,   0.0,   1.0
  );
  gl_FragColor = colorMatrix * color;
}
`,
  tritanomaly: `
void main() {
  vec4 color = texture2D(uTexture0, vTextureCoords);
  mat4 colorMatrix = mat4(
    0.967, 0.033, 0.0,   0.0, // R
    0.0,   0.733, 0.267, 0.0, // G compensado
    0.0,   0.183, 0.817, 0.0, // B compensado
    0.0,   0.0,   0.0,   1.0
  );
  gl_FragColor = colorMatrix * color;
}
`

};