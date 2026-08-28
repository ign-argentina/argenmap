# Contributing

To collaborate with the development of Argenmap, we suggest first checking in the issues section if there are changes or requests in process. You can also report bugs or propose ideas in this section.

## Repository commands

Install exactly the dependencies recorded in `package-lock.json` before running
the commands:

```bash
npm ci
```

| Command | Description |
| --- | --- |
| `npm test` | Runs automated tests and compatibility checks. |
| `npm run build` | Generates the optimized, versioned, and compressed publication in `build/`. |
| `npm run build:versioned` | Resolves the version from the branch, may create a semantic tag on release branches, and then generates the build. |
| `npm run measure:performance` | Compares cold and warm startup through Chrome/Chromium. It requires an existing build. |

See the [deployment guide](deployment.md) for build variants and the
[reproducible measurement guide](performance.md) for options, metrics, and the
JSON format. To list every measurement option:

```bash
npm run measure:performance -- --help
```

The development team can also be contacted from the website of the National Geographic Institute.

To make changes to the app, we recommend making a fork of this repository and then requesting their integration through a pull request, which will remain for evaluation.
