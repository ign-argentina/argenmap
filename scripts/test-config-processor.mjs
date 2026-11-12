import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

// Cargar el procesador de configuración
const processorSource = fs.readFileSync(
  "src/js/components/messaging/config-processor.js",
  "utf8"
);

// Cargar ConfigurationAdapter desde app.js para pruebas de integración con el adaptador
const appSource = fs.readFileSync("src/js/app.js", "utf8");
const adapterStart = appSource.indexOf("const CURRENT_CONFIG_SCHEMA_VERSION");
const adapterEnd = appSource.indexOf("function normalizeConfigSectionsAndLayers");
assert.ok(adapterStart >= 0 && adapterEnd > adapterStart, "ConfigurationAdapter code slice exists in app.js");

const context = vm.createContext({ console });
vm.runInContext(
  `${appSource.slice(adapterStart, adapterEnd)}\nglobalThis.ConfigurationAdapter = ConfigurationAdapter;`,
  context
);
vm.runInContext(processorSource, context);
const ConfigProcessor = context.ConfigProcessor;

assert.ok(ConfigProcessor, "ConfigProcessor exists and is exported correctly");
assert.equal(typeof ConfigProcessor.validateConfig, "function");
assert.equal(typeof ConfigProcessor.deepMerge, "function");
assert.equal(typeof ConfigProcessor.prepareConfigUpdate, "function");

console.log("Iniciando bateria de pruebas para ConfigProcessor...");

// Fixture de configuracion base representativa del editor y Argenmap
const sampleValidConfig = {
  data: {
    template: "ign-geoportal-basic",
    items: [
      {
        type: "basemap",
        peso: 1,
        nombre: "Mapas base",
        seccion: "mapasbase",
        capas: [
          {
            titulo: "Argenmap",
            nombre: "argenmap",
            servicio: "tms",
            version: "1.0.0",
            attribution: "Instituto Geografico Nacional",
            host: "https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/capabaseargenmap/{z}/{x}/{-y}.png",
            selected: true,
            zoom: { min: 3, max: 21, nativeMin: 3, nativeMax: 21 }
          },
          {
            titulo: "Argenmap gris",
            nombre: "argenmap_gris",
            servicio: "tms",
            version: "1.0.0",
            attribution: "IGN",
            host: "https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/mapabase_gris/{z}/{x}/{-y}.png",
            selected: false,
            zoom: { min: 3, max: 21 }
          }
        ]
      },
      {
        type: "wmslayer",
        nombre: "Limites y unidades territoriales",
        seccion: "limites",
        host: "https://wms.ign.gob.ar/geoserver/limites/wms",
        servicio: "wms",
        version: "1.3.0",
        peso: 10
      }
    ]
  },
  preferences: {
    title: "Argenmap - Mapa Base",
    website: "https://www.ign.gob.ar",
    mapConfig: {
      center: { latitude: -40, longitude: -59 },
      zoom: { initial: 4, min: 3, max: 21 }
    },
    theme: {
      headerBackground: "#157DB9",
      menuBackground: "#157DB9"
    },
    onInit: {
      showToolbar: true,
      showLayerMenu: false
    }
  }
};

// =========================================================================
// ESCENARIO 1: Configuración completa válida
// =========================================================================
{
  const result = ConfigProcessor.validateConfig(sampleValidConfig, { partial: false });
  assert.equal(result.isValid, true, "Escenario 1: debe ser valida");
  assert.equal(result.errors.length, 0, "Escenario 1: no debe tener errores");

  const prep = ConfigProcessor.prepareConfigUpdate({}, sampleValidConfig, { partial: false });
  assert.equal(prep.isValid, true, "Escenario 1: preparacion valida");
  assert.ok(prep.prepared.data.items, "Escenario 1: items preservados en data");
  assert.equal(prep.prepared.preferences.title, "Argenmap - Mapa Base");
  console.log("  [OK] Escenario 1: Configuracion completa valida");
}

// =========================================================================
// ESCENARIO 2: Configuración incompleta
// =========================================================================
{
  // En configuracion completa (partial: false), un objeto vacio {} es incompleto
  const result = ConfigProcessor.validateConfig({}, { partial: false });
  assert.equal(result.isValid, false, "Escenario 2: objeto vacio debe ser invalido en modo completo");
  assert.ok(result.errors.some((e) => e.includes("data") || e.includes("preferences")));

  const prep = ConfigProcessor.prepareConfigUpdate(sampleValidConfig, {}, { partial: false });
  assert.equal(prep.isValid, false, "Escenario 2: prepareConfigUpdate rechaza payload vacio en full");
  assert.equal(prep.prepared, null, "Escenario 2: prepared debe ser null");
  console.log("  [OK] Escenario 2: Configuracion incompleta");
}

// =========================================================================
// ESCENARIO 3: Payload con estructura incorrecta
// =========================================================================
{
  const invalidPayloads = [null, undefined, "texto", 12345, true, [1, 2, 3]];
  for (const badPayload of invalidPayloads) {
    const val = ConfigProcessor.validateConfig(badPayload);
    assert.equal(val.isValid, false, `Escenario 3: payload ${typeof badPayload} debe ser invalido`);
    assert.ok(val.errors.length > 0);

    const prep = ConfigProcessor.prepareConfigUpdate(sampleValidConfig, badPayload);
    assert.equal(prep.isValid, false);
    assert.equal(prep.prepared, null);
  }
  console.log("  [OK] Escenario 3: Payloads no-objeto correctamente rechazados");
}

// =========================================================================
// ESCENARIO 4: Configuración con mapas base válidos
// =========================================================================
{
  const basemapPayload = {
    data: {
      items: [
        {
          type: "basemap",
          seccion: "mapasbase",
          capas: [
            {
              nombre: "argenmap_oscuro",
              titulo: "Argenmap Oscuro",
              host: "https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/argenmap_oscuro/{z}/{x}/{-y}.png",
              zoom: { min: 3, max: 19 }
            }
          ]
        }
      ]
    }
  };
  const val = ConfigProcessor.validateConfig(basemapPayload, { partial: true });
  assert.equal(val.isValid, true, "Escenario 4: mapa base valido");
  assert.equal(val.errors.length, 0);
  console.log("  [OK] Escenario 4: Mapas base validos");
}

// =========================================================================
// ESCENARIO 5: Configuración con capas WMS válidas
// =========================================================================
{
  const wmsPayload = {
    data: {
      items: [
        {
          type: "wmslayer",
          nombre: "Capa WMS Test",
          seccion: "test",
          host: "https://wms.ign.gob.ar/geoserver/test/wms",
          servicio: "wms",
          version: "1.3.0"
        }
      ]
    }
  };
  const val = ConfigProcessor.validateConfig(wmsPayload, { partial: true });
  assert.equal(val.isValid, true, "Escenario 5: capa WMS valida");
  assert.equal(val.errors.length, 0);
  console.log("  [OK] Escenario 5: Capas WMS validas");
}

// =========================================================================
// ESCENARIO 6: Configuración con valores numéricos inválidos
// =========================================================================
{
  const invalidCoords = [
    { mapConfig: { center: { latitude: 95, longitude: -58 } } }, // lat > 90
    { mapConfig: { center: { latitude: -40, longitude: -200 } } }, // lng < -180
    { mapConfig: { center: { latitude: "invalido", longitude: -58 } } }, // not a number
    { mapConfig: { zoom: { initial: -1 } } }, // zoom < 0
    { mapConfig: { zoom: { min: 15, max: 10 } } } // min > max
  ];

  for (const bad of invalidCoords) {
    const val = ConfigProcessor.validateConfig({ preferences: bad }, { partial: true });
    assert.equal(val.isValid, false, `Escenario 6: debe fallar con valores numericos invalidos: ${JSON.stringify(bad)}`);
    assert.ok(val.errors.length > 0);
  }
  console.log("  [OK] Escenario 6: Valores numericos invalidos rechazados");
}

// =========================================================================
// ESCENARIO 7: Configuración con propiedades opcionales adicionales
// =========================================================================
{
  const extraPropsPayload = {
    preferences: {
      title: "Titulo Valido",
      customAnalyticsToken: "xyz-123",
      unrecognizedPluginFeature: { enabled: true, mode: "fast" },
      mapConfig: {
        center: { latitude: -34.6, longitude: -58.4 },
        zoom: { initial: 10 }
      }
    }
  };

  const val = ConfigProcessor.validateConfig(extraPropsPayload, { partial: true });
  assert.equal(val.isValid, true, "Escenario 7: propiedades opcionales/desconocidas no deben invalidar");

  const prep = ConfigProcessor.prepareConfigUpdate(sampleValidConfig, extraPropsPayload, { partial: true });
  assert.equal(prep.isValid, true);
  // Las propiedades desconocidas deben preservarse en el prepared
  assert.equal(prep.prepared.preferences.customAnalyticsToken, "xyz-123");
  assert.deepEqual(
    JSON.parse(JSON.stringify(prep.prepared.preferences.unrecognizedPluginFeature)),
    { enabled: true, mode: "fast" }
  );
  console.log("  [OK] Escenario 7: Propiedades opcionales adicionales preservadas sin rechazo");
}

// =========================================================================
// ESCENARIO 8: Actualización parcial de propiedades simples
// =========================================================================
{
  const partialSimple = {
    preferences: {
      title: "Nuevo Titulo Actualizado",
      website: "https://nuevo-sitio.gob.ar"
    }
  };

  const prep = ConfigProcessor.prepareConfigUpdate(sampleValidConfig, partialSimple, { partial: true });
  assert.equal(prep.isValid, true);
  assert.equal(prep.isPartial, true);
  assert.equal(prep.hasChanges, true);
  assert.equal(prep.prepared.preferences.title, "Nuevo Titulo Actualizado");
  assert.equal(prep.prepared.preferences.website, "https://nuevo-sitio.gob.ar");
  // Debe conservar el mapConfig y data sin tocar
  assert.equal(prep.prepared.preferences.mapConfig.zoom.initial, 4);
  assert.equal(prep.prepared.preferences.mapConfig.center.latitude, -40);
  assert.equal(prep.prepared.data.items.length, 2);
  console.log("  [OK] Escenario 8: Actualizacion parcial de propiedades simples");
}

// =========================================================================
// ESCENARIO 9: Actualización parcial de objetos anidados
// =========================================================================
{
  const partialNested = {
    preferences: {
      mapConfig: {
        zoom: {
          initial: 12
        }
      }
    }
  };

  const prep = ConfigProcessor.prepareConfigUpdate(sampleValidConfig, partialNested, { partial: true });
  assert.equal(prep.isValid, true);
  // Debe haber cambiado solo zoom.initial, conservando center, min y max
  assert.equal(prep.prepared.preferences.mapConfig.zoom.initial, 12);
  assert.equal(prep.prepared.preferences.mapConfig.zoom.min, 3);
  assert.equal(prep.prepared.preferences.mapConfig.zoom.max, 21);
  assert.equal(prep.prepared.preferences.mapConfig.center.latitude, -40);
  assert.equal(prep.prepared.preferences.mapConfig.center.longitude, -59);
  assert.ok(prep.changedSections.includes("mapConfig.zoom"));
  console.log("  [OK] Escenario 9: Actualizacion parcial de objetos anidados");
}

// =========================================================================
// ESCENARIO 10: Preservación de propiedades no modificadas y falsy válidos
// =========================================================================
{
  // Valores falsy legítimos: 0, false, "", null
  const falsyUpdate = {
    preferences: {
      onInit: {
        showToolbar: false, // booleano false
        showLayerMenu: 0    // numero 0
      },
      website: "",          // string vacio
      customNullProp: null  // null explicito
    }
  };

  const prep = ConfigProcessor.prepareConfigUpdate(sampleValidConfig, falsyUpdate, { partial: true });
  assert.equal(prep.isValid, true);
  assert.equal(prep.prepared.preferences.onInit.showToolbar, false, "false debe preservarse");
  assert.equal(prep.prepared.preferences.onInit.showLayerMenu, 0, "0 debe preservarse");
  assert.equal(prep.prepared.preferences.website, "", "string vacio debe preservarse");
  assert.equal(prep.prepared.preferences.customNullProp, null, "null debe preservarse");
  // Lo no especificado (ej theme, mapConfig) debe permanecer
  assert.equal(prep.prepared.preferences.theme.headerBackground, "#157DB9");
  console.log("  [OK] Escenario 10: Preservacion de propiedades y tratamiento exacto de valores falsy");
}

// =========================================================================
// ESCENARIO 11: Inmutabilidad estricta de objetos de entrada
// =========================================================================
{
  const originalBase = JSON.parse(JSON.stringify(sampleValidConfig));
  const incoming = {
    preferences: {
      title: "Mutacion Intento",
      mapConfig: { zoom: { initial: 9 } }
    }
  };
  const originalIncoming = JSON.parse(JSON.stringify(incoming));

  ConfigProcessor.prepareConfigUpdate(sampleValidConfig, incoming, { partial: true });

  assert.deepEqual(sampleValidConfig, originalBase, "Escenario 11: baseConfig no fue mutado");
  assert.deepEqual(incoming, originalIncoming, "Escenario 11: incomingPayload no fue mutado");
  console.log("  [OK] Escenario 11: Inmutabilidad garantizada al 100%");
}

// =========================================================================
// ESCENARIO 12: Validación fallida no produce resultados parcialmente preparados
// =========================================================================
{
  const corruptPayload = {
    preferences: {
      title: "Titulo Aceptable",
      mapConfig: {
        center: { latitude: 9999, longitude: -58 } // Corrupcion fatal
      }
    }
  };

  const prep = ConfigProcessor.prepareConfigUpdate(sampleValidConfig, corruptPayload, { partial: true });
  assert.equal(prep.isValid, false, "Escenario 12: debe marcarse invalido");
  assert.equal(prep.prepared, null, "Escenario 12: prepared DEBE ser null");
  assert.ok(prep.errors.length > 0, "Escenario 12: deben reportarse errores");
  assert.equal(prep.changedSections.length, 0, "Escenario 12: no debe reportar cambios aplicados");
  console.log("  [OK] Escenario 12: Sin estado parcialmente preparado ante error");
}

// =========================================================================
// ESCENARIO ADICIONAL: Reemplazo total de arreglo items en data (regla de oro)
// =========================================================================
{
  const newItemsPayload = {
    data: {
      items: [
        {
          type: "basemap",
          nombre: "Nuevo Grupo Basemap",
          seccion: "mapasbase",
          capas: [
            {
              nombre: "nueva_capa_base",
              titulo: "Nueva Capa Base",
              host: "https://servidor.com/tms/{z}/{x}/{y}.png"
            }
          ]
        }
      ]
    }
  };

  const prep = ConfigProcessor.prepareConfigUpdate(sampleValidConfig, newItemsPayload, { partial: true });
  assert.equal(prep.isValid, true);
  // data.items no debe haberse concatenado a 3 elementos; debe ser exactamente 1 nuevo elemento
  assert.equal(prep.prepared.data.items.length, 1);
  assert.equal(prep.prepared.data.items[0].nombre, "Nuevo Grupo Basemap");
  // template de data previo debe haberse preservado
  assert.equal(prep.prepared.data.template, "ign-geoportal-basic");
  console.log("  [OK] Escenario Adicional: Reemplazo completo de arrays (sin concatenacion)");
}

console.log("\nTodos los escenarios de prueba pasaron exitosamente!");
