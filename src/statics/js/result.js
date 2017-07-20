/**
 * Created by 35002 on 2017/6/27.
 */
$(function(){
    var d=[],linkdata=[],cateData=[],contentD=[],contentLink=[],contentCate=[],myChart,contHtml,
        titHtml,titleoption,cont,title,inner=[],myCircle,myChartt;
    var vm=new Vue({
        data:{
            inputText:'',
            contentStyle:true,
            titleStyle:false,
            innerData:[],
            innerColor:[],
            outData:[],
            outColor:[],
            show:false,
            zfShow:false,
            loading:false
        },
        methods:{
            contentChange:function(){
                title=this.inputText;
                this.contentStyle=true;
                this.titleStyle=false;
                this.show=false;
                this.loading=true;
                $('#chinese').html('');
                $('.zf-analysis').css('display','block');
                $('#chinese').html(contHtml);
                $('.title-relation').hide();
                $('.cont-relation').show();
                this.inputText=cont;
            },
            titleChange:function(){
                cont=this.inputText;
                this.contentStyle=false;
                this.titleStyle=true;
                this.show=true
                this.loading=false;
                $('#chinese').html('');
                $('.zf-analysis').css('display','none');
                $('#chinese').html(titHtml);
                $('.title-relation').show();
                $('.cont-relation').hide();
                this.inputText=title;
            },
            empty:function(){
                this.inputText='';
                if(this.titleStyle){
                    titHtml='';
                    $('#chinese').html(titHtml);
                    $('#entityContent').html('');
                    myCircle.clear();
                    myChartt.clear();
                }else if(this.contentStyle){
                    contHtml='';
                    $('.smile-percent').html('50');
                    $('.cry-percent').html('50');
                    $('.smile-show').css('width','50%');
                    $('.cry-show').css('width','50%');
                    $('#chinese').html(contHtml);
                    myChart.clear();
                }
            },
            submit:function(){
                   if(this.inputText==''){
                       this.empty();
                   }else {
                       //内容分析
                       if(this.contentStyle){
                           cont=vm.inputText;
                           if(this.inputText==''){
                               $('.smile-percent').html('50');
                               $('.cry-percent').html('50');
                               $('.smile-show').css('width','50%');
                               $('.cry-show').css('width','50%');
                           }
                           //中文分词
                           $.ajax({
                               type:'POST',
                               url:'http://10.112.75.12:8081/nlp/getContentSegment',
                               data:{text:this.inputText},
                               success:function(data){
                                   var html='';
                                   for(var i=0;i<data.map.length;i++){
                                       data.map[i]=data.map[i].trim();
                                       html+='<span>'+data.map[i]+'</span>';
                                   }
                                   contHtml=html;

                                   $('#chinese').html(html);
                               }
                           });
                           //文本正负面
                           $.ajax({
                               type:'POST',
                               url:'http://10.112.75.12:8081/nlp/getSentiment',
                               data:{text:this.inputText},
                               success:function(data){
                                   console.log(data.map);
                                   var smile=Math.round(((data.map[1]).toFixed(2)*100));
                                   // var cry=(1-data.map[1]).toFixed(2)*100;
                                   var cry=100-smile;
                                   //var cry=(data.map[0]).toFixed(3)*100
                                   $('.smile-percent').html(smile);
                                   $('.cry-percent').html(cry);
                                   $('.smile-show').css('width',smile+'%');
                                   $('.cry-show').css('width',cry+'%');
                               },
                               error:function(){
                               }
                           });
                           //联想词
                           $.ajax({
                               type:'POST',
                               url:'http://10.112.75.12:8081/nlp/getNewsWordVector',
                               data:{text:vm.inputText},
                               success:function(data){
                                   contentD.length=0;
                                   var key=[], id= 0, parentId;
                                   for(var i in data.map){
                                       contentD.push({
                                           category: 0,
                                           id: id,
                                           name: i,
                                           symbol: 'circle',
                                           symbolSize: 50,
                                           itemStyle: {
                                               normal: {
                                                   color: '#333333',
                                                   label : {
                                                       show : true,
                                                       //position : 'inside',
                                                       //formatter : '{b}',
                                                       textStyle: {
                                                           color: '#fff'
                                                       }
                                                   },
                                               }
                                           }
                                       })
                                       parentId = id;
                                       id++;
                                       contentCate.push([{name:i}]);
                                       key.push(parentId), contentCate.push([{name:i}]);
                                       contentLink.push({ source:parentId, target:key[key.length-2]});
                                       for(var j=0;j<data.map[i].length;j++){
                                           contentD.push({ category: 1,
                                               id: id,
                                               name: data.map[i][j],
                                               symbol: 'circle',
                                               symbolSize: 40,
                                               itemStyle: {
                                                   normal: {
                                                       color: '#ffae00',
                                                       label : {
                                                           show : true,
                                                           //position : 'inside',
                                                           //formatter : '{b}',
                                                           textStyle: {
                                                               color: '#333'
                                                           }
                                                       },
                                                   }
                                               }});
                                           if(j>8){
                                               break;
                                           }
                                           contentCate.push([{name:data.map[i][j]}]);
                                           contentLink.push({ source:id, target: parentId})
                                           id++;
                                       }

                                   }
                                   // 指定图表的配置项和数据
                                   var  option = {
                                       tooltip: {
                                           show: true,
                                           trigger: 'axis',
                                       },
                                       color:['#ff7f50','#87cefa'],
                                       animationDuration: 1500,
                                       animationEasingUpdate: 'quinticInOut',
                                       series: [
                                           {
                                               type: 'graph',
                                               layout : 'force',
                                               xAxisIndex : 10,
                                               yAxisIndex : 10,
                                               draggable: true,
                                               roam: false,
                                               initial:[580,400],
                                               fixX:true,
                                               fixY:true,
                                               force : {
                                                   gravity : 0.05,//节点受到的向中心的引力因子。该值越大节点越往中心点靠拢。
                                                   edgeLength: 100, //默认距离
                                                   repulsion: 70, //斥力
                                                   layoutAnimation:true,
                                               },
                                               itemStyle : {
                                                   normal : {
                                                       label : {
                                                           show : true,
                                                           //position : 'inside',
                                                           //formatter : '{b}',
                                                           textStyle: {
                                                               color: '#000'
                                                           }
                                                       },
                                                       edgeLength: 200,
                                                       borderType : 'solid',
                                                       //borderColor : 'rgba(255,215,0,0.4)',
                                                       borderWidth : 2,
                                                       opacity : 1

                                                   }
                                               },
                                               lineStyle : {
                                                   normal : {
                                                       color : '#999999',
                                                       width : '1',
                                                       type : 'solid',
                                                       curveness : 0.3,
                                                       opacity : 1
                                                   }
                                               },
                                               data: contentD,
                                               categories:contentCate,
                                               links: contentLink
                                           }],
                                   };


                                   $('#relationC').css('height',key.length*100+'px');
                                   myChart = echarts.init(document.getElementById('relationC'))
                                   myChart.setOption(option);
                                   myChart.resize();

                               }
                           });
                       }
                       //标题分析
                       if(this.titleStyle){
                           title=vm.inputText;
                           //中文分词
                           $.ajax({
                               type:'POST',
                               url:'http://10.112.75.12:8081/nlp/segment',
                               data:{text:this.inputText},
                               success:function(data){
                                   var html='';
                                   for(var i=0;i<data.list.length;i++){
                                       html+='<span>'+data.list[i]+'</span>';
                                   }
                                   titHtml=html;

                                   $('#chinese').html(html);
                               }
                           });
                           //实体识别
                           $.ajax({
                               type:'POST',
                               url:'http://10.112.75.12:8081/nlp/identify',
                               data:{text:this.inputText},
                               success:function(data){
                                   //var text=vm.inputText;
                                   //console.log(data);
                                   ////将list中的word数据按长度排序 遵循长度优先匹配
                                   //data.list=data.list.sort(function(a,b){return b['word'].length - a['word'].length})
                                   //for(var i=0;i<data.list.length;i++){
                                   //    var reg =new RegExp("("+data.list[i].word+")","ig") //全局匹配 不区分大小写
                                   //    text=text.replace(reg,'<span class="text-'+data.list[i].nature+'">'+data.list[i].word+'</span>')
                                   //}
                                   //$('#entityContent').html(text);
                                   //$('#entityContent>span').each(function(i,v){
                                   //    if(v.children.length>0){
                                   //        console.log(123);
                                   //        var child=$(v).html();
                                   //        child=child.replace(/<span.*?>(.*?)<\/span>/g,"$1"); //如果已经匹配到的长的字符串中再一次匹配到短的字符串 则把短的字符串匹配去除
                                   //        console.log(child);
                                   //        $(v).html(child);
                                   //    }
                                   //})
                                   html='';
                                   for(var i in data.list){
                                       console.log(data.list[i]);
                                       for(var item in data.list[i]){
                                           html+='<span class="text-'+data.list[i][item]+'">'+item+'</span>'
                                       }
                                   }

                                   $('#entityContent').html(html);
                               },
                               error:function(){
                               }
                           });
                           //Word2Vector
                           $.ajax({
                               type:'POST',
                               url:'http://10.112.75.12:8081/nlp/getWordVector',
                               data:{text:vm.inputText},
                               success:function(data){
                                   d.length=0;
                                   var key=[], id= 0, parentId;
                                   var brandLen,coreLen,brandCalLen,coreCalLen;
                                   for(var i in data.map){
                                       d.push({
                                           category: 0,
                                           id: id,
                                           name: i,
                                           symbol: 'circle',
                                           symbolSize: 50,
                                           itemStyle: {
                                               normal: {
                                                   color: '#333333',
                                                   label : {
                                                       show : true,
                                                       //position : 'inside',
                                                       //formatter : '{b}',
                                                       textStyle: {
                                                           color: '#fff'
                                                       }
                                                   },
                                               }
                                           }
                                       })
                                       parentId = id;
                                       id++;
                                       cateData.push([{name:i}]);
                                       key.push(parentId), cateData.push([{name:i}]);
                                       linkdata.push({ source:parentId, target:key[key.length-2]});
                                       brandLen = data.map[i]['BRAND'].length;
                                       coreLen = data.map[i]['CORE'].length;
                                       if(brandLen + coreLen <= 10){
                                           brandCalLen = brandLen;
                                           coreCalLen = coreLen;
                                       }else if(brandLen >= 5 && coreLen >= 5) {
                                           brandCalLen = 5;
                                           coreCalLen = 5;
                                       }else if(brandLen > 5 && coreLen < 5){
                                           brandCalLen = 10 - coreLen;
                                           coreCalLen = coreLen;
                                       }else if(brandLen < 5 && coreLen > 5){
                                           brandCalLen = brandLen;
                                           coreCalLen = 10 - brandLen;
                                       }

                                       for(var j=0;j < brandCalLen;j++){
                                           d.push({ category: 1,
                                               id: id,
                                               name: data.map[i]['BRAND'][j],
                                               symbol: 'circle',
                                               symbolSize: 40,
                                               itemStyle: {
                                                   normal: {
                                                       color: '#cc286a',
                                                       label : {
                                                           show : true,
                                                           //position : 'inside',
                                                           //formatter : '{b}',
                                                           textStyle: {
                                                               color: '#333'
                                                           }
                                                       },
                                                   }

                                               }});
                                           cateData.push([{name:data.map[i]['BRAND'][j]}]);
                                           linkdata.push({ source:id, target: parentId})
                                           id++;

                                       }
                                       for(var j=0;j < coreCalLen;j++){
                                           d.push({
                                               category: 1,
                                               id: id,
                                               name: data.map[i]['CORE'][j],
                                               symbol: 'circle',
                                               symbolSize: 40,
                                               itemStyle: {
                                                   normal: {
                                                       color: '#ffae00',
                                                       label : {
                                                           show : true,
                                                           //position : 'inside',
                                                           //formatter : '{b}',
                                                           textStyle: {
                                                               color: '#333'
                                                           }
                                                       },
                                                   }
                                               }
                                           })
                                           cateData.push([{name:data.map[i]['CORE'][j]}]);
                                           linkdata.push({ source:id, target: parentId})
                                           id++;

                                       }
                                   }
                                   // 指定图表的配置项和数据
                                   titleoption = {
                                       tooltip: {
                                           show: true,
                                           trigger: 'axis',
                                       },
                                       color:['#ff7f50','#87cefa'],
                                       animationDuration: 1500,
                                       animationEasingUpdate: 'quinticInOut',
                                       series: [
                                           {
                                               type: 'graph',
                                               layout : 'force',
                                               xAxisIndex : 10,
                                               yAxisIndex : 10,
                                               draggable: true,
                                               roam: false,
                                               initial:[580,400],
                                               fixX:true,
                                               fixY:true,
                                               force : {
                                                   gravity : 0.05,//节点受到的向中心的引力因子。该值越大节点越往中心点靠拢。
                                                   edgeLength: 100, //默认距离
                                                   repulsion: 70, //斥力
                                                   layoutAnimation:true,
                                               },
                                               itemStyle : {
                                                   normal : {
                                                       label : {
                                                           show : true,
                                                           //position : 'inside',
                                                           //formatter : '{b}',
                                                           textStyle: {
                                                               //color: '#fff'
                                                           }
                                                       },
                                                       edgeLength: 200,
                                                       borderType : 'solid',
                                                       borderWidth : 2,
                                                       opacity : 1

                                                   }
                                               },
                                               lineStyle : {
                                                   normal : {
                                                       color : '#999999',
                                                       width : '1',
                                                       type : 'solid',
                                                       curveness : 0.3,
                                                       opacity : 1
                                                   }
                                               },
                                               data: d,
                                               categories:cateData,
                                               links: linkdata
                                           }],
                                   };
                                   $('#relationT').css('height',key.length*200+'px');
                                   myChartt = echarts.init(document.getElementById('relationT'))
                                   myChartt.setOption(titleoption);
                                   myChartt.resize();
                               }
                           });
                           //文本分类
                           $.ajax({
                               type:'POST',
                               url:'http://10.112.75.12:8081/nlp/getClassify',
                               data:{text:this.inputText},
                               beforeSend:function(){vm.loading=true},
                               success:function(data){
                                   inner.length=0;
                                   for(var i  in data.map){
                                       inner.push({value:data.map[i],name:i});
                                   }
                                   inner=inner.sort(function(a,b){return a.value < b.value ? 1 : -1});
                                   vm.innerData.length=0;
                                   vm.outData.length=0;
                                   vm.outColor.length=0;
                                   vm.innerColor.length=0;
                                   for(var i=0;i<inner.length;i++){
                                       var pieData = {value: 1, name: inner[i].name};
                                       i < 2 && (pieData.name+='\n'+(inner[i].value).toFixed(2));
                                       if(i%2==0){
                                           vm.outData.push(pieData);
                                           vm.outColor.push("#1593e7");
                                       } else {
                                           vm.innerData.push(pieData);
                                           vm.innerColor.push("#1568c9");
                                       }
                                   }
                                   vm.innerColor[0] =  vm.outColor[0]="#d43f39";
                                   vm.outData[0].value = vm.innerData[0].value =2;
                                   $('#textClassify').css('height','400px');
                                   myCircle = echarts.init(document.getElementById('textClassify'))
                                   var opt = {
                                       legend: {
                                           orient: 'vertical',
                                       },
                                       series: [
                                           {
                                               name:'访问来源',
                                               type:'pie',
                                               center : ['50%', '50%'],
                                               label: {
                                                   normal: {
                                                       position: 'inner',
                                                       offset:[30,40],
                                                       textStyle: {
                                                           fontSize: '12',
                                                           fontWeight: 'normal',
                                                           // color:'#020f13'
                                                       }
                                                   }
                                               },
                                               labelLine: {
                                                   smooth:1,
                                                   length:1,
                                               },
                                               type:'pie',
                                               radius: ['10%', '50%'],
                                               color:vm.innerColor,
                                               data:vm.innerData
                                           },
                                           {
                                               name:'访问来源',
                                               type:'pie',
                                               radius: ['60%', '90%'],
                                               label: {
                                                   normal: {
                                                       position:'inner',
                                                       textStyle: {
                                                           fontSize: '12',
                                                           fontWeight: 'normal',
                                                           // color:'#020f13'
                                                       }
                                                   }
                                               },
                                               color:vm.outColor,
                                               data:vm.outData
                                           }
                                       ]
                                   };
                                   myCircle.setOption(opt);
                                   vm.loading=false

                               },
                               error:function(){

                               }
                           });
                       }
                   }

               }

        }
    }).$mount('#app');
})