# Contribuyendo a Argenmap


Gracias por tu interés en contribuir a Argenmap. Antes de enviar tu contribución, por favor lee estas pautas cuidadosamente.


## Consideraciones generales


Argenmap está comprometido con mantener un código simple, ligero y rápido. Por lo tanto, las correcciones de errores, optimizaciones de rendimiento y pequeñas mejoras que no agreguen mucho código serán más propensas a ser aceptadas rápidamente.


## Antes de enviar un Pull Request


Si estás considerando una nueva característica, responde estas preguntas primero:


1. ¿Estás seguro de que esta nueva característica es lo suficientemente importante como para justificar su presencia en el núcleo de Argenmap? ¿Funcionaría mejor como un plugin en un repositorio separado?
2. ¿Está escrita de una manera simple y concisa que no agregue volumen innecesario al código base?


## Pautas para Pull Requests


1. **Un cambio a la vez**: Cada Pull Request debe abordar un solo problema o agregar una sola funcionalidad. Esto facilita la revisión y la integración.


2. **Casos de prueba**: Incluye casos de prueba que demuestren que tu cambio solucionó un error o agregó una nueva funcionalidad.


3. **Cada cosa en su lugar** Siempre deberías escribir cada lote de cambios (funcionalidad, arreglo de errores, etc.) en la rama que corresponda a su tema. Por favor no hagas un commit a la rama principal del proyecto tu Fork. De lo contrario, los cambios no relacionados se incluirán en la misma solicitud de extracción.


4. **Documentación**: Si tu característica o mejora se fusiona en la rama principal, considera enviar otro Pull Request con la actualización de documentación correspondiente.


5. **Formato de código**: No mezcles cambios de formato con correcciones de errores o nuevas funcionalidades. Estos cambios, aunque pueden parecer inofensivos, hacen que el parche sea mucho más difícil de leer. Si necesitas reformatear el código, hazlo en un commit separado.


## Reporte de errores


Antes de reportar un error, asegúrate de que el problema se deba a Argenmap y no a tu implementación de la aplicación, como errores al escribir la configuración o capas referenciadas incorrectamente. También busca si ya se ha reportado un caso similar o si se trata de un uso incorrecto como ingresar una URL inválida de un servicio WMS.


Una vez que hayas confirmado que se trata de un nuevo error de Argenmap, sigue estos consejos para crear un reporte útil:


- Escribe un **título descriptivo y específico**. Ejemplo malo: *Problema con polilíneas*. Ejemplo bueno: *Hacer X en Y causa Z*.
- Incluye información sobre el **navegador, sistema operativo y versión de Argenmap** en la descripción.
- Agrega un **caso de prueba simple** que demuestre el error, es decir una lista de pasos para reproducir el error.
- Verifica si el error se puede reproducir en **otros navegadores**.
- Revisa si el error ocurre en la versión estable, la rama principal, o en ambas.
- *Consejo adicional:* Si el error solo aparece en la rama principal pero la versión estable funciona bien, usa `git bisect` para encontrar el commit exacto que introdujo el error.






## Cómo ayudar si no sabés de código


¡No es necesario que seas un experto en programación para contribuir a Argenmap! Hay muchas formas en las que puedes ayudarnos:


- **Prueba la beta**: Entra a la [beta online](https://mapa.ign.gob.ar/beta/) o Descarga la última versión beta de Argenmap y evalúa su funcionamiento. Reporta cualquier problema o sugerencia que observes.
- **Difunde la palabra**: Comparte Argenmap con tus colegas, amigos y en tus redes sociales ¡Cuanta más gente conozca nuestra aplicación, mejor!
- **Mejora la documentación**: ¿Encontraste algo confuso o que podría explicarse mejor? ¡Háznoslo saber!
- **Ayuda a otros usuarios** Responde preguntas en issues o redes sociales.
- (Próximamente) **Diseño**: Puedes darnos sugerencias de cómo mejorar la estética de la aplicación, íconos o paneles.

Todas las contribuciones, sin importar el nivel de experiencia, son valiosas para hacer de Argenmap un mejor proyecto. ¡Gracias por tu apoyo!


## Reglas de formato


Argenmap sigue reglas específicas de formato para mantener la consistencia del código.


## Proceso de revisión


1. El equipo que desarrolla Argenmap revisará tu Pull Request tan pronto como sea posible.
2. Pueden sugerir cambios o mejoras.
3. Una vez que se aprueben los cambios, tu contribución se fusionará en la rama apropiada.




Agradecemos tu contribución a Argenmap y esperamos trabajar contigo para mejorar este visor de mapas de código abierto.
