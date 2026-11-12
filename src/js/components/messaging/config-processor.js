/**
 * @file config-processor.js
 * @description Utilidades de validación, normalización y preparación de
 * configuraciones para la integración bidireccional entre Argenmap y aplicaciones externas
 * (como editor-argenmap).
 *
 * Implementado en JavaScript Vanilla puro. Compatible con entornos de navegador
 * (globalThis.ConfigProcessor) y Node.js para pruebas unitarias.
 */

(function (root, factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = factory();
  } else {
    root.ConfigProcessor = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  /**
   * Determina si un valor es un objeto plano (no nulo, no arreglo, no función).
   * @param {*} value - Valor a evaluar.
   * @returns {boolean} Verdadero si es un objeto plano.
   */
  function isPlainObject(value) {
    return (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value) &&
      Object.prototype.toString.call(value) === "[object Object]"
    );
  }

  /**
   * Clona profundamente un valor preservando tipos primitivos, objetos planos y arreglos.
   * Evita fugas de mutabilidad entre referencias.
   * @param {*} value - Valor a clonar.
   * @returns {*} Clon profundo del valor.
   */
  function deepClone(value) {
    if (value === null || typeof value !== "object") {
      return value;
    }
    if (Array.isArray(value)) {
      return value.map(deepClone);
    }
    if (value instanceof Date) {
      return new Date(value.getTime());
    }
    if (value instanceof RegExp) {
      return new RegExp(value.source, value.flags);
    }
    const copy = {};
    for (const key of Object.keys(value)) {
      copy[key] = deepClone(value[key]);
    }
    return copy;
  }

  /**
   * Valida la subestructura mapConfig (centro y niveles de zoom).
   * @param {*} mapConfig - Configuración de mapa a evaluar.
   * @returns {{ isValid: boolean, errors: string[], warnings: string[] }}
   */
  function validateMapConfig(mapConfig) {
    const errors = [];
    const warnings = [];

    if (!isPlainObject(mapConfig)) {
      errors.push("mapConfig debe ser un objeto plano.");
      return { isValid: false, errors, warnings };
    }

    if ("center" in mapConfig) {
      if (!isPlainObject(mapConfig.center)) {
        errors.push("mapConfig.center debe ser un objeto.");
      } else {
        const { latitude, longitude } = mapConfig.center;
        if (latitude !== undefined) {
          if (typeof latitude !== "number" || !Number.isFinite(latitude)) {
            errors.push("mapConfig.center.latitude debe ser un número finito.");
          } else if (latitude < -90 || latitude > 90) {
            errors.push("mapConfig.center.latitude debe estar entre -90 y 90.");
          }
        }
        if (longitude !== undefined) {
          if (typeof longitude !== "number" || !Number.isFinite(longitude)) {
            errors.push("mapConfig.center.longitude debe ser un número finito.");
          } else if (longitude < -180 || longitude > 180) {
            errors.push("mapConfig.center.longitude debe estar entre -180 y 180.");
          }
        }
      }
    }

    if ("zoom" in mapConfig) {
      if (!isPlainObject(mapConfig.zoom)) {
        errors.push("mapConfig.zoom debe ser un objeto.");
      } else {
        const { initial, min, max } = mapConfig.zoom;
        if (initial !== undefined) {
          if (typeof initial !== "number" || !Number.isFinite(initial)) {
            errors.push("mapConfig.zoom.initial debe ser un número finito.");
          } else if (initial < 0 || initial > 25) {
            errors.push("mapConfig.zoom.initial debe estar en el rango 0..25.");
          }
        }
        if (min !== undefined) {
          if (typeof min !== "number" || !Number.isFinite(min)) {
            errors.push("mapConfig.zoom.min debe ser un número finito.");
          } else if (min < 0 || min > 25) {
            errors.push("mapConfig.zoom.min debe estar en el rango 0..25.");
          }
        }
        if (max !== undefined) {
          if (typeof max !== "number" || !Number.isFinite(max)) {
            errors.push("mapConfig.zoom.max debe ser un número finito.");
          } else if (max < 0 || max > 25) {
            errors.push("mapConfig.zoom.max debe estar en el rango 0..25.");
          }
        }
        if (min !== undefined && max !== undefined && min > max) {
          errors.push(`mapConfig.zoom.min (${min}) no puede ser mayor que max (${max}).`);
        }
        if (initial !== undefined && min !== undefined && initial < min) {
          warnings.push(`mapConfig.zoom.initial (${initial}) es menor que zoom.min (${min}).`);
        }
        if (initial !== undefined && max !== undefined && initial > max) {
          warnings.push(`mapConfig.zoom.initial (${initial}) es mayor que zoom.max (${max}).`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Valida la estructura de capas base dentro de data.items.
   * @param {Object} basemapItem - Elemento de mapa base en items[0].
   * @param {number} index - Índice del elemento en el arreglo items.
   * @param {string[]} errors - Arreglo acumulador de errores.
   * @param {string[]} warnings - Arreglo acumulador de advertencias.
   */
  function validateBasemapItem(basemapItem, index, errors, warnings) {
    if (!Array.isArray(basemapItem.capas)) {
      errors.push(`items[${index}] de tipo 'basemap' debe incluir un arreglo 'capas'.`);
      return;
    }
    if (basemapItem.capas.length === 0) {
      warnings.push(`items[${index}].capas no contiene capas base definidas.`);
    }

    basemapItem.capas.forEach((capa, capaIndex) => {
      if (!isPlainObject(capa)) {
        errors.push(`items[${index}].capas[${capaIndex}] debe ser un objeto.`);
        return;
      }
      const nombre = capa.nombre || capa.titulo || capa.name || capa.title;
      if (!nombre || typeof nombre !== "string") {
        errors.push(`items[${index}].capas[${capaIndex}] requiere una propiedad 'nombre' o 'titulo'.`);
      }
      const url = capa.host || capa.url;
      if (!url || typeof url !== "string") {
        errors.push(`items[${index}].capas[${capaIndex}] requiere una URL en 'host' o 'url'.`);
      }
      if (capa.zoom && isPlainObject(capa.zoom)) {
        const { min, max } = capa.zoom;
        if (min !== undefined && (typeof min !== "number" || !Number.isFinite(min))) {
          errors.push(`items[${index}].capas[${capaIndex}].zoom.min debe ser un número finito.`);
        }
        if (max !== undefined && (typeof max !== "number" || !Number.isFinite(max))) {
          errors.push(`items[${index}].capas[${capaIndex}].zoom.max debe ser un número finito.`);
        }
      }
    });
  }

  /**
   * Valida la estructura del objeto data (capas, mapas base y templates).
   * @param {*} data - Objeto data a evaluar.
   * @param {boolean} [isPartial=false] - Indica si la validación corresponde a una actualización parcial.
   * @returns {{ isValid: boolean, errors: string[], warnings: string[] }}
   */
  function validateData(data, isPartial = false) {
    const errors = [];
    const warnings = [];

    if (!isPlainObject(data)) {
      errors.push("El objeto 'data' debe ser un objeto plano.");
      return { isValid: false, errors, warnings };
    }

    if ("template" in data && typeof data.template !== "string") {
      errors.push("data.template debe ser una cadena de texto.");
    }

    if ("items" in data) {
      if (!Array.isArray(data.items)) {
        errors.push("data.items debe ser un arreglo.");
      } else {
        if (!isPartial && data.items.length === 0) {
          warnings.push("data.items está vacío en una configuración completa.");
        }
        data.items.forEach((item, index) => {
          if (!isPlainObject(item)) {
            errors.push(`data.items[${index}] debe ser un objeto.`);
            return;
          }
          const itemType = item.type || item.servicio || "";
          if (itemType === "basemap") {
            validateBasemapItem(item, index, errors, warnings);
          } else {
            // Capa temática (wms, wmslayer, wmts, file, etc.)
            const nombre = item.nombre || item.name || item.seccion;
            if (!nombre || typeof nombre !== "string") {
              warnings.push(`data.items[${index}] no especifica 'nombre' o 'seccion' legible.`);
            }
            const host = item.host || item.url || item.source?.url;
            if (!host && itemType !== "folder") {
              warnings.push(`data.items[${index}] no contiene URL en 'host' o 'url'.`);
            }
          }
        });
      }
    }

    // Esquema 2.0 alternativo (baseMapGroups, layerGroups, dataSources)
    if ("baseMapGroups" in data && !Array.isArray(data.baseMapGroups)) {
      errors.push("data.baseMapGroups debe ser un arreglo.");
    }
    if ("layerGroups" in data && !Array.isArray(data.layerGroups)) {
      errors.push("data.layerGroups debe ser un arreglo.");
    }
    if ("dataSources" in data && !Array.isArray(data.dataSources)) {
      errors.push("data.dataSources debe ser un arreglo.");
    }
    if ("layers" in data && !Array.isArray(data.layers)) {
      errors.push("data.layers debe ser un arreglo.");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Valida la estructura del objeto preferences (preferencias visuales y de interacción).
   * @param {*} preferences - Objeto preferences a evaluar.
   * @param {boolean} [isPartial=false] - Indica si la validación corresponde a una actualización parcial.
   * @returns {{ isValid: boolean, errors: string[], warnings: string[] }}
   */
  function validatePreferences(preferences, isPartial = false) {
    const errors = [];
    const warnings = [];

    if (!isPlainObject(preferences)) {
      errors.push("El objeto 'preferences' debe ser un objeto plano.");
      return { isValid: false, errors, warnings };
    }

    if ("title" in preferences && typeof preferences.title !== "string") {
      errors.push("preferences.title debe ser una cadena de texto.");
    }

    if ("website" in preferences && typeof preferences.website !== "string") {
      warnings.push("preferences.website no es una cadena de texto.");
    }

    if ("mapConfig" in preferences) {
      const mapConfigValidation = validateMapConfig(preferences.mapConfig);
      errors.push(...mapConfigValidation.errors);
      warnings.push(...mapConfigValidation.warnings);
    } else if (!isPartial) {
      warnings.push("preferences no contiene 'mapConfig' en una configuración completa.");
    }

    if ("theme" in preferences && !isPlainObject(preferences.theme)) {
      warnings.push("preferences.theme no es un objeto plano.");
    }

    if ("logo" in preferences && !isPlainObject(preferences.logo)) {
      warnings.push("preferences.logo no es un objeto plano.");
    }

    if ("logoText" in preferences && !isPlainObject(preferences.logoText)) {
      warnings.push("preferences.logoText no es un objeto plano.");
    }

    if ("onInit" in preferences && !isPlainObject(preferences.onInit)) {
      warnings.push("preferences.onInit no es un objeto plano.");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Desempaqueta y extrae los objetos data y preferences del payload recibido.
   * Soporta payload directo { data, preferences } o envuelto en { config: { data, preferences } }.
   * @param {*} payload - Payload recibido.
   * @returns {{ data: Object|null, preferences: Object|null, raw: Object, isWrapped: boolean }}
   */
  function unwrapConfigPayload(payload) {
    if (!isPlainObject(payload)) {
      return { data: null, preferences: null, raw: payload, isWrapped: false };
    }

    // Caso 1: envuelto en { config: { data, preferences } }
    if (isPlainObject(payload.config)) {
      const inner = payload.config;
      return {
        data: isPlainObject(inner.data) ? inner.data : null,
        preferences: isPlainObject(inner.preferences) ? inner.preferences : null,
        raw: inner,
        isWrapped: true,
      };
    }

    // Caso 2: directo { data, preferences }
    return {
      data: isPlainObject(payload.data) ? payload.data : null,
      preferences: isPlainObject(payload.preferences) ? payload.preferences : null,
      raw: payload,
      isWrapped: false,
    };
  }

  /**
   * Valida un payload de configuración externo, completo o parcial.
   * @param {*} payload - Payload JSON a evaluar.
   * @param {Object} [options={}] - Opciones de validación.
   * @param {boolean} [options.partial=false] - Indica si es actualización parcial.
   * @returns {{
   *   isValid: boolean,
   *   errors: string[],
   *   warnings: string[],
   *   data: Object|null,
   *   preferences: Object|null,
   *   isPartial: boolean
   * }}
   */
  function validateConfig(payload, options = {}) {
    const isPartial = Boolean(options.partial ?? payload?.partial ?? false);
    const errors = [];
    const warnings = [];

    if (!isPlainObject(payload)) {
      return {
        isValid: false,
        errors: ["El payload de configuración debe ser un objeto plano no nulo."],
        warnings: [],
        data: null,
        preferences: null,
        isPartial,
      };
    }

    const { data, preferences, raw } = unwrapConfigPayload(payload);

    // Si no tiene data ni preferences como contenedores, verificar si el payload
    // mismo representa preferences o data directamente (caso común en parciales: { mapConfig: {...} })
    let effectiveData = data;
    let effectivePreferences = preferences;

    if (!effectiveData && !effectivePreferences) {
      if ("mapConfig" in raw || "title" in raw || "theme" in raw) {
        effectivePreferences = raw;
      } else if ("items" in raw || "baseMapGroups" in raw || "layerGroups" in raw) {
        effectiveData = raw;
      }
    }

    if (!isPartial) {
      // En configuración completa debe existir al menos data o preferences
      if (!effectiveData && !effectivePreferences) {
        errors.push("La configuración completa debe incluir 'data' o 'preferences'.");
      }
    } else {
      // En configuración parcial debe aportarse al menos una propiedad
      if (!effectiveData && !effectivePreferences && Object.keys(raw).length === 0) {
        errors.push("La actualización parcial no contiene cambios ni propiedades para aplicar.");
      }
    }

    if (effectiveData) {
      const dataValidation = validateData(effectiveData, isPartial);
      errors.push(...dataValidation.errors);
      warnings.push(...dataValidation.warnings);
    }

    if (effectivePreferences) {
      const prefValidation = validatePreferences(effectivePreferences, isPartial);
      errors.push(...prefValidation.errors);
      warnings.push(...prefValidation.warnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      data: effectiveData,
      preferences: effectivePreferences,
      isPartial,
    };
  }

  /**
   * Fusión profunda controlada (Deep Merge) para actualizaciones parciales.
   *
   * Reglas estrictas:
   * 1. Objetos planos anidados se fusionan recursivamente.
   * 2. Arreglos se REEMPLAZAN COMPLETOS por un clon de la fuente (nunca se concatenan ni fusionan por índice).
   * 3. Primitivos (números, booleanos, cadenas, null) se reemplazan.
   * 4. undefined en la fuente no modifica el valor destino (preservación de propiedades ausentes).
   * 5. No muta target ni source; genera un nuevo objeto resultante.
   *
   * @param {Object} target - Objeto base destino.
   * @param {Object} source - Objeto fuente con cambios parciales.
   * @returns {Object} Nuevo objeto resultante de la fusión.
   */
  function deepMerge(target, source) {
    if (!isPlainObject(target)) {
      return isPlainObject(source) ? deepClone(source) : source;
    }
    if (!isPlainObject(source)) {
      return deepClone(target);
    }

    const output = deepClone(target);

    for (const key of Object.keys(source)) {
      const sourceVal = source[key];
      const targetVal = output[key];

      if (sourceVal === undefined) {
        // Propiedad ausente: no sobreescribir
        continue;
      }

      if (Array.isArray(sourceVal)) {
        // Regla estricta: reemplazo total de arreglos
        output[key] = deepClone(sourceVal);
      } else if (isPlainObject(sourceVal)) {
        if (isPlainObject(targetVal)) {
          output[key] = deepMerge(targetVal, sourceVal);
        } else {
          output[key] = deepClone(sourceVal);
        }
      } else {
        // Primitivo (incluso null, false, 0, "")
        output[key] = sourceVal;
      }
    }

    return output;
  }

  /**
   * Normaliza los datos utilizando ConfigurationAdapter si está disponible en el entorno,
   * preservando íntegramente la estructura de items del editor.
   * @param {Object} config - Objeto con { data, preferences }.
   * @param {Object} [adapter] - Adaptador opcional (por defecto ConfigurationAdapter global).
   * @returns {{ data: Object, preferences: Object }} Configuración normalizada.
   */
  function normalizeConfig(config, adapter) {
    const activeAdapter =
      adapter || (typeof ConfigurationAdapter !== "undefined" ? ConfigurationAdapter : null);

    const cloned = deepClone(config);
    const data = cloned.data || {};
    const preferences = cloned.preferences || {};

    let normalizedData = data;
    let normalizedPreferences = preferences;

    if (activeAdapter) {
      if (typeof activeAdapter.adaptData === "function" && Object.keys(data).length > 0) {
        // Guardar referencia a items originales para no perder el formato del editor
        const originalItems = data.items;
        normalizedData = activeAdapter.adaptData(data);
        if (originalItems && !normalizedData.items) {
          normalizedData.items = originalItems;
        }
      }
      if (typeof activeAdapter.adaptPreferences === "function" && Object.keys(preferences).length > 0) {
        normalizedPreferences = activeAdapter.adaptPreferences(preferences);
      }
    }

    return {
      data: normalizedData,
      preferences: normalizedPreferences,
    };
  }

  /**
   * Detecta diferencias estructuradas entre dos configuraciones para guiar al actualizador en caliente.
   * @param {Object} base - Configuración base previa.
   * @param {Object} updated - Configuración actualizada.
   * @returns {string[]} Lista de secciones modificadas (ej: ['mapConfig.center', 'data.items']).
   */
  function detectChanges(base, updated) {
    const changes = [];
    const basePref = base?.preferences || {};
    const upPref = updated?.preferences || {};
    const baseData = base?.data || {};
    const upData = updated?.data || {};

    // 1. Centro
    const baseCenter = basePref.mapConfig?.center;
    const upCenter = upPref.mapConfig?.center;
    if (
      upCenter &&
      (upCenter.latitude !== baseCenter?.latitude || upCenter.longitude !== baseCenter?.longitude)
    ) {
      changes.push("mapConfig.center");
    }

    // 2. Zoom
    const baseZoom = basePref.mapConfig?.zoom;
    const upZoom = upPref.mapConfig?.zoom;
    if (
      upZoom &&
      (upZoom.initial !== baseZoom?.initial ||
        upZoom.min !== baseZoom?.min ||
        upZoom.max !== baseZoom?.max)
    ) {
      changes.push("mapConfig.zoom");
    }

    // 3. Título
    if (upPref.title !== undefined && upPref.title !== basePref.title) {
      changes.push("preferences.title");
    }

    // 4. Tema
    if (upPref.theme && JSON.stringify(upPref.theme) !== JSON.stringify(basePref.theme)) {
      changes.push("preferences.theme");
    }

    // 5. Capas / Items en data
    if (upData.items && JSON.stringify(upData.items) !== JSON.stringify(baseData.items)) {
      changes.push("data.items");
    }

    // 6. Template
    if (upData.template && upData.template !== baseData.template) {
      changes.push("data.template");
    }

    return changes;
  }

  /**
   * Prepara una actualización de configuración completa o parcial de manera segura e inmutable.
   *
   * @param {Object} baseConfig - Configuración actual del visor ({ data, preferences }).
   * @param {*} incomingPayload - Payload recibido externamente.
   * @param {Object} [options={}] - Opciones de preparación.
   * @param {boolean} [options.partial] - Forzar modalidad parcial (true) o completa (false).
   * @param {Object} [options.adapter] - Adaptador opcional para normalización.
   * @returns {{
   *   isValid: boolean,
   *   errors: string[],
   *   warnings: string[],
   *   isPartial: boolean,
   *   hasChanges: boolean,
   *   changedSections: string[],
   *   prepared: { data: Object, preferences: Object } | null
   * }} Resultado de la preparación listo para ser aplicado por el visor.
   */
  function prepareConfigUpdate(baseConfig, incomingPayload, options = {}) {
    // 1. Detección de modalidad parcial vs completa
    const isPartial = Boolean(
      options.partial ??
      incomingPayload?.partial ??
      false
    );

    // 2. Validación estricta sin mutaciones
    const validation = validateConfig(incomingPayload, { partial: isPartial });
    if (!validation.isValid) {
      return {
        isValid: false,
        errors: validation.errors,
        warnings: validation.warnings,
        isPartial,
        hasChanges: false,
        changedSections: [],
        prepared: null,
      };
    }

    const safeBase = isPlainObject(baseConfig) ? deepClone(baseConfig) : { data: {}, preferences: {} };
    const incomingData = validation.data ? deepClone(validation.data) : null;
    const incomingPreferences = validation.preferences ? deepClone(validation.preferences) : null;

    let preparedData;
    let preparedPreferences;

    if (!isPartial) {
      // Modalidad Completa: reemplazo total con fallback seguro a base si se omitió una rama
      preparedData = incomingData || safeBase.data || {};
      preparedPreferences = incomingPreferences || safeBase.preferences || {};
    } else {
      // Modalidad Parcial: fusión profunda
      preparedPreferences = incomingPreferences
        ? deepMerge(safeBase.preferences || {}, incomingPreferences)
        : safeBase.preferences || {};

      if (incomingData) {
        // En data, si se envían items nuevos, reemplazan a los items anteriores
        // preservando las otras claves de data (template, etc.)
        const currentData = safeBase.data || {};
        preparedData = deepMerge(currentData, incomingData);
        if (Array.isArray(incomingData.items)) {
          preparedData.items = deepClone(incomingData.items);
        }
      } else {
        preparedData = safeBase.data || {};
      }
    }

    // Normalizar conservando estructura canónica
    const normalized = normalizeConfig(
      { data: preparedData, preferences: preparedPreferences },
      options.adapter
    );

    // Detectar cambios
    const changedSections = detectChanges(safeBase, normalized);
    const hasChanges = changedSections.length > 0;

    return {
      isValid: true,
      errors: [],
      warnings: validation.warnings,
      isPartial,
      hasChanges,
      changedSections,
      prepared: normalized,
    };
  }

  // Interfaz pública exportada
  return {
    isPlainObject,
    deepClone,
    deepMerge,
    validateMapConfig,
    validateData,
    validatePreferences,
    validateConfig,
    normalizeConfig,
    detectChanges,
    prepareConfigUpdate,
  };
});
