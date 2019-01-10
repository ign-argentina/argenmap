module.exports = function(grunt) {
    "use strict";

    var pkg = grunt.file.readJSON('bower.json');

    grunt.initConfig({
        pkg: pkg,
        uglify: {
            options: {
                banner: '/* <%= pkg.name %> <%= pkg.version %> <%= pkg.license %>\n' +
                        '   <%= pkg.homepage %>\n' +
                        '   ' + pkg.authors.join('\n   ') + ' */\n'
            },
            build: {
                expand: true,
                cwd: 'dist',
                src: ['**/*.js', '!**/*.min.js'],
                ext: '.min.js',
                extDot: 'last',
                dest: 'dist'
            }
        },
        jshint: {
            options: {
                bitwise: true,
                curly: true,
                eqeqeq: true,
                forin: true,
                globals: {
                    L: false
                },
                latedef: 'nofunc',
                undef: true,
                unused: true
            },
            all: ['dist/**/*.js', '!dist/**/*.min.js']
        },
        shell: {
            test: {
                command: 'node_modules/.bin/mocha tests/bootstrap.js tests --timeout 10000',
            },
            tav: {
                command: 'node_modules/.bin/tav',
            },
        },
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-shell');

    grunt.registerTask('test-all', ['shell:tav']);
    grunt.registerTask('test', ['shell:test']);
    grunt.registerTask('default', ['jshint', 'test-all', 'uglify']);
};

