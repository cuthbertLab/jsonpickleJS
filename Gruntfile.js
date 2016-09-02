// Gruntfile for jsonPickle
const path = require('path');

module.exports = (grunt) => {
    const babel = require('rollup-plugin-babel');
    
    const BANNER = '/**\n' +
        '  * jsonpickle.js <%= pkg.version %> built on ' + 
        '  * <%= grunt.template.today("yyyy-mm-dd") %>.\n' +
        ' * Copyright (c) 2013-2016 Michael Scott Cuthbert and cuthbertLab\n' +
        ' *\n' +
        ' * http://github.com/cuthbertLab/jsonpickleJS\n' +
        ' */\n';
    const BASE_DIR = __dirname;
    const BUILD_DIR = path.join(BASE_DIR, 'build');
    const TARGET_RAW = path.join(BUILD_DIR, 'jsonpickle.debug.js');
    const TARGET_MIN = path.join(BUILD_DIR, 'jsonpickle.min.js');
    const MODULE_ENTRY = path.join(BASE_DIR, 'main.js');

    const SOURCES = ['*.js', '!Gruntfile.js'];

    grunt.initConfig({
	    pkg: grunt.file.readJSON('package.json'),
	    concat: {
	        options: {
	            banner: BANNER,
	            sourceMap: true
	        },
	    },
        rollup: {
            options: {
                banner: BANNER,
                format: 'umd',
                moduleName: 'jsonpickle',
                sourceMap: true,
                sourceMapFile: TARGET_RAW,
                plugins: function() {
                    return [
                      babel({
                        exclude: './node_modules/**'
                      })
                    ];
                  },
            },   
            files: {
                src: MODULE_ENTRY,
                dest: TARGET_RAW
            }
        },
	    uglify: {
	        options: {
	            banner: BANNER,
	            sourceMap: true
	        },
	        build: {
	            src: TARGET_RAW,
	            dest: TARGET_MIN
	        }
	    },
	    eslint: {
	        target: SOURCES,
	        options: {
	          configFile: '.eslintrc.json',
	        },
	    },
        watch: {
	         scripts: {
	           files: ['*.js'],
	           tasks: ['rollup'],
	           options: {
	             interrupt: true
	           }
	         },
        },	    
	    // raise the version number
	    bump: {
	        options: {
	          files: ['package.json'], // 'component.json'],
	          commitFiles: ['package.json'], // 'component.json'],
	          updateConfigs: ['pkg'],
	          createTag: false,
	          push: false
	        }
	    },
	    
	});

    grunt.loadNpmTasks('grunt-rollup');
    grunt.loadNpmTasks('grunt-contrib-concat');
       
    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    
    // Plugin for the jsdoc task
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-eslint');

    // Default task(s).
    grunt.registerTask('default', ['rollup', 'uglify:build']); //, 'eslint', ... 'jsdoc']); 
    grunt.registerTask('test', 'Run qunit tests', ['rollup', 'qunit']);
    grunt.registerTask('publish', 'Raise the version and publish', function () { 
        grunt.task.run('bump');
    });
};