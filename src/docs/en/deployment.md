## Requirements

- Web server (Nginx, Apache, lighttpd, etc.)

## Fast deployment guide

### 1st step: download code

Clone the repository or download as a ZIP file:

To clone, use the following command (it requires to have Git installed):

```
git clone https://github.com/ign-argentina/argenmap.git
```

Or download the repository from: 

https://github.com/ign-argentina/argenmap/archive/master.zip

### 2nd step: set the configuration 

The base maps and layers can be defined in the `data.json` and the app configuration in `preferences.json`.

> Changes on 'data' will be loaded after reloading the app as happens with any web page.

This step is detailed in the **[Configuration](configuration.md)** article.

### 3rd step: publish 

Publish this repository with a web server or a debug tool as LiveServer in Visual Studio Code, etc.

## Next: [Configuration](configuration.md)
