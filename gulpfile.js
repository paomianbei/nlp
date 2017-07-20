/**
 * Created by weikaiwei on 2016/10/11.
 */
var gulp = require("gulp"), path = require("path"), fs = require("fs"), $ = require("gulp-load-plugins")();
module.exports = function(){
    gulp.task("local", function(){
        $.connect.server({
            host: "10.2.49.41", // 默认localhost
            port: "80", // 默认8000
            root: ["dist/page", "dist"], // 指定项目主目录，多个使用数组
            livereload: true //自动刷新
        });
    });
    gulp.task("server", function(){
        copyStatic("src", "dist");
    });
};
module.exports();
function copyStatic(copyFrom, distTo, rev){
    rev || (rev = "./rev");
    gulp.watch([path.join(copyFrom, "**/*"), `!${path.join(copyFrom, "!*/**/*")}`, `!${path.join(copyFrom, "**/__*")}`, `!${path.join(copyFrom, "**/*.{sass,scss,styl,es6,vue,mustache}")}`], function(e){
        var ext = path.extname(e.path), basename = path.basename(e.path), sname = basename.replace(new RegExp(ext + "$"), ""), type = e.type,//type: "changed"、"delete"、"added"
            reg = new RegExp(path.join(copyFrom, path.sep).replace(/\\/g, "\\\\") + "(.+)\\\\(\\..*)?"),
            matches = e.path.match(reg), pre = matches && matches[1] || "",
            distPath = path.join(distTo, pre), pipe, loginfo;

        if(type != "delete"){
            try{
                if(fs.statSync(e.path).isDirectory())return;
            }catch (e){
                return;
            }
            if(!/\.(less|sass|scss|styl)/.test(ext) || !basename.startsWith("_")){
                loginfo = 'staticWatch: from "' + e.path + ' to "' + distPath + '"';
                pipe = gulp.src(e.path,{base: copyFrom}).pipe($.plumber({errorHandler: $.notify.onError('Error: <%= error.message %>')})) // 异常处理;
                    .pipe($.fileInclude({
                        prefix: '@@',
                        basepath: '@root'//@root，被包含的文件的路径相对于gulp服务启动的路径；@file  被@@include包含的文件路径是相对于当前使用文件的路径
                    }))
                    .pipe($.replace(/\$\{rc.contextPath\}/ig, ".."));
                switch(ext){
                    case ".less":
                        pipe = pipe
                            .pipe($.sourcemaps.init())
                            .pipe($.less())
                            .pipe($.csscomb())// 设置css属性顺序
                            .pipe($.csso({
                                restructure: true, // 优化css写法
                                sourceMap: true // 与gulp-sourcemaps一起使用，设置成false将不会生成map文件
                                // debug: true // 输出调试日志
                            }))
                            // .pipe($.replace(/(font-(?:(?:size)|(?:family))\s*:[\s\S]*?)(\d+)px/ig, function(a, b, c){
                            .pipe($.replace(/(\d*\.?\d+)pt/ig, function(a, b, c){// 转换成rem单位
                                return (b / 100) + "rem";
                            }))
                            .pipe($.rev()).pipe(gulp.dest(distTo))
                            .pipe($.rev.manifest(sname + ".json")).pipe(gulp.dest(path.join(rev, pre)))
                            .pipe($.sourcemaps.write("."));
                        break;
                    case ".jsp":case ".html":
                    pipe = pipe
                        .pipe($.addSrc(path.join(rev, "**/*.json"))).pipe($.revCollector({
                            replaceReved: false, // 替换过的时候可以再替换
                            dirReplacements: { // 替换最接近文件名部分的路径
                            }
                        }))
                        .pipe($.htmlmin({
                            collapseWhitespace: true, // 清除空格，压缩html
                            collapseBooleanAttributes: true, // 省略布尔属性的值，比如：<input checked="checked"/>,那么设置这个属性后，就会变成 <input checked/>;
                            removeComments: true, // 清除html中注释的部分
                            removeEmptyAttributes: true, // 清除所有的空属性（自定义属性不会被清除）
                            removeScriptTypeAttributes: true, // 清除所有script标签中的type="text/javascript"属性
                            removeStyleLinkTypeAttributes: true, // 清除所有Link标签上的type属性
                            minifyJS: true, // 压缩html中的javascript代码
                            minifyCSS: true // 压缩html中的css代码
                        }))
                        .pipe(gulp.dest(distTo));
                    break;
                    case ".js":
                        console.log("pre = " + pre);
                        pipe = pipe
                            .pipe($.uglifyjs({
                                    mangle: true, // 代码混淆
                                    compress: {
                                        drop_console: true//清除console.log语句
                                    },
                                    output: {beautify: false}// 去掉格式化
                                })
                            )
                            .pipe($.rev())
                            .pipe(gulp.dest(distTo))
                            .pipe($.rev.manifest(sname + ".json"))
                            .pipe(gulp.dest(path.join(rev, pre)))
                        break;
                    case ".png":case ".gif":case ".jpg":case ".bmp":
                    pipe = pipe.pipe($.imagemin({
                        optimizationLevel: 3, //类型：Number  默认：3  取值范围：0-7（优化等级）
                        progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
                        interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
                        multipass: true //类型：Boolean 默认：false 多次优化svg直到完全优化
                    }));
                    break;
                }
                console.log(loginfo);
                pipe && pipe//.pipe(gulp.dest(distPath))//.pipe($.connect.reload());
            }
        }
    });
}