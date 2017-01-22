
//FINAL PROJECT -- Ryan Morrill + Xinhe Yu

var margin = {t:5,r:5,b:5,l:5};
var width = document.getElementById('plot').clientWidth-margin.l-margin.r,
    height = document.getElementById('plot').clientHeight-margin.t-margin.b;
    Dwidth= document.getElementById('mainDash').clientWidth-margin.l-margin.r,
    Dheight = document.getElementById('mainDash').clientHeight-margin.t-margin.b;

var force = d3.layout.force()
    .size([Dwidth,Dheight])
    .charge(0)
    .gravity(0);

//setting up primary dispatch function

var dispatch = d3.dispatch('customHover','customLeave');

// reload on screen resize
window.onresize = function(
    ){ location.reload(); }



// ------------scroll magic setup and start / end scenes-------------

var controller = new ScrollMagic.Controller({
    globalSceneOptions:{
        //offset:275
    }
});


var scene1 = new ScrollMagic.Scene({
        //specifies options for the scene
        triggerElement:".headerArea",
        duration:800,
        triggerHook:.2,
        offset:600,
        reverse:true
    })
    .on('progress',function(e){
         //console.log(e.progress);
         d3.selectAll('.start')
        .style('opacity',e.progress)
        d3.selectAll('.scroll')
        .style('opacity',.9-(e.progress*1.5))

    })

    .addTo(controller);




var scaleFade = d3.scale.linear().domain([.89,.96]).range([1,-1]);
var scaleFade2 = d3.scale.linear().domain([.89,.96]).range([0,2]);


var scene2 = new ScrollMagic.Scene({
        //specifies options for the scene
        triggerElement:".canvas",
        duration:9000,
        triggerHook:.2,
        offset:600,
        reverse:true
    })
    .on('progress',function(e){
         //console.log(e.progress);
         d3.selectAll('.start')
        .style('opacity',function(d){if (e.progress>=.85){  return scaleFade(e.progress)}else return 1})
         d3.selectAll('.finish')
        .style('opacity',function(d){if (e.progress>=.85){  return scaleFade2(e.progress)}else return 0})
        .style('z-index', function(d){if (e.progress>=.92){ return 5000}})
    })



    .addTo(controller);

// Scene container
var testScene = [];




// Adds commas to numbers
function addComma(num){
    var commaCount = 0;
    var string = num.toString();
    var returnString ="";

    // get comma count
    if(string.length%3!=0){
        commaCount = parseInt(string.length/3);
    }
    else{
        commaCount = parseInt(string.length/3)-1;
    }

    // generate comma
    if(commaCount>0){
        for(var i=0; i<commaCount; i++){
            returnString = ","+string.substr(string.length-3*(i+1),3)+returnString;
            if(i==commaCount-1){
                if(string.length%3==0){
                    returnString = string.substr(0,3)+returnString;
                }
                else{
                    returnString = string.substr(0,string.length%3)+returnString;
                }
            }
        }
        return returnString;
    }
    else{
        return string
    }
}




// creating tooltips from module

var tooltipLeft = d3.customTooltip()
    .classTag("tooltipLeft")
    .paragraph(4);
d3.select(".customTooltips").call(tooltipLeft);

var tooltipRight = d3.customTooltip()
    .classTag("tooltipRight")
    .paragraph(4)
    .style("position","relative");
d3.select(".customTooltips").call(tooltipRight);

var tooltipBar = d3.customTooltip()
    .classTag("tooltipBar")
    .paragraph(1)
    .style("width","100px")
d3.select('.customTooltips').call(tooltipBar);


        // variable to translate outcome numbers in data -- for the tooltips

    var outcomeGroup = {
        1: "Won",
        2: "Lost",
        3: "Compromise/Tied",
        4: "The war was transformed into another type of war",
        5: "The war was transformed into another type of war",
        6: "Stalemate",
        7: "Conflict continues at below war level",
        8: "Changed sides"
    }



// creating primary plotting svg groups


var plot = d3.select('.canvas')
    .append('svg')
    .attr('width',width+margin.l+margin.r)
    .attr('height',height+margin.t+margin.b)
    .append('g')
    .attr('class','plot')
    .attr('transform', 'translate (0,200)');

var dashboard = d3.select('.mainDash')
    .append('svg')
    .attr('width',Dwidth+margin.r+margin.r)
    .attr('height',Dheight+margin.t+margin.b)
    .append('g')
    .attr('class','dashboard')
    .attr('transform', 'translate ('+margin.r+','+margin.r+')');  

var casualtiesChart = dashboard.append('g')
    .attr('class','casualtiesChart')

var chartHeight = Dheight*.89;
var chartWidth = Dwidth/2;




///-----------SCALES AND AXIS ------------------



var yScaleCasualty = d3.scale.linear().domain([0,1000000]).range([1,chartHeight])
var colorScale = d3.scale.ordinal().domain([1,2,3,4,5,6,7,8,9,10])
    .range(["black","rgba(157,157,157,1)","rgba(134,134,134,1)","rgba(134,134,134,1)","rgba(134,134,134,1)","rgba(134,134,134,1)","rgba(134,134,134,1)","rgba(134,134,134,1)","rgba(134,134,134,1)","rgba(134,134,134,1)"]);
 var colorScaleFill = d3.scale.ordinal().domain([1,2,3,4,5,6,7,8,9,10])
    .range(["rgba(254,254,254,1)","rgba(245,245,245,1)","rgb(253,253,253)","rgb(253,253,253)","rgb(253,253,253)","rgb(253,253,253)","rgb(253,253,253)","rgb(253,253,253)","rgb(253,253,253)","rgb(253,253,253)"]);
var scaleYLines = d3.time.scale().domain([new Date(1823,0,1),new Date(2005,0,1)]).range([0,8000])
var scaleX = d3.scale.linear().domain([0,700]).range([0,chartWidth])
var scaleXright = d3.scale.linear().domain([1,124]).range([0,width*.75])
var scaleR = d3.scale.sqrt().domain([0,4500000]).range([0,300]);


var axisY = d3.svg.axis()
    .orient('right')
    .ticks(20)
    .scale(scaleYLines);

 plot.append('g').attr('class','axis axis-y')
     .attr('transform', 'translate ('+width*.8+',0)')
  .call(axisY);



///----------- Loading data and dataLoaded function ------------------


d3.csv('data/war_data.csv',parse,dataLoaded);


//--- wars variable for crossfilter

 var wars;

function dataLoaded(err,data){

    //--- create crossfilter, which allows filtering of data based on war name (data.war)

    wars = crossfilter(data);

    var casualtiesByWar = wars.dimension(function(data){return data.war;});


    // data mine-------------------------------------------------

    // Casualties of each war
    var nestedByWarNum = d3.nest()
        .key(function(d){return d.warNum;})
        .entries(data);

    //----------------------------------------------------------************ Data for scroll***********
    var warNumArray = [];

    nestedByWarNum.forEach(function(d,i){

        //Scroll data
        var arrayIndex = warNumArray.push({
                warNum:d.key,
                WarName:d.values[0].war,
                casualties:0,
                warStartEle:null,
                sceneDuration:null,
                hasScrollScene:false,
                totalCasualties:0
            })-1;
        var casualtiesOfWar = 0;
        var tempStart = new Date(),
            tempEnd = null;

        for(var j=0;j<d.values.length;j++){
            //get start date and end date of the war
            if(scaleYLines(d.values[j].startDate)<scaleYLines(tempStart)){
                warNumArray[arrayIndex].warStartEle = d.values[j];
                tempStart = d.values[j].startDate;
            }
            if((scaleYLines(d.values[j].endDate)>scaleYLines(tempEnd))||tempEnd==null){
                tempEnd = d.values[j].endDate;

            }

            casualtiesOfWar += d.values[j].casualties;
        }
        // Casualties Array

        warNumArray[i].casualties=casualtiesOfWar;

        // Calculate total casualties until this war
        if(i==0){
            warNumArray[i].totalCasualties=casualtiesOfWar;
        }
        else{
            warNumArray[i].totalCasualties=casualtiesOfWar+warNumArray[i-1].totalCasualties;
        }
        //get war scene duration

        warNumArray[i].sceneDuration = scaleYLines(tempEnd)-scaleYLines(tempStart);



    });

    

    warNumArray.sort(function(a,b){
        return b.casualties - a.casualties;
    });








//////----------------------------------------------------------------------------------LEFT CASUALTIES CHART-------------/////


    var barWidth = 3;
    //console.log(warNumArray);
    casualtiesChart.selectAll('rect')
        .data(warNumArray.filter(function(d){return d.casualties >=0}))
        .enter()
        .append('rect')
        .attr('class','lines').attr('id','casChartPrepend')
        .attr('x',function(d,i){ return scaleX(i*(barWidth+2)); })
        .attr('y',function(d){return chartHeight - yScaleCasualty(d.casualties)})
        .attr('width',barWidth)
        .attr('height',function(d){ return yScaleCasualty(d.casualties);})
        .attr('fill','rgba(214,214,214,.9)')

        .on('mouseover',function(d,i){

            d3.select(this).attr('stroke','rgb(185,213,50)')
            var xP = parseFloat(d3.select(this).attr("x"))+parseFloat(d3.select("#mainDash").style("margin-left")),
                    yP = parseFloat(d3.select(this).attr("y")*.92);

            if(yP<0){
                yP=0;
            }

                tooltipBar.position(xP,yP,"none");

                tooltipBar.update("show",[
                "<strong>" + d.WarName + "</strong>",
                ]);

        })

        .on('click',function(d,i){
            var warName = d.WarName;

            // click sroll
            var yP = document.getElementById("plot").offsetTop + parseFloat(d3.select("#plot").style("padding-top"))+parseFloat(d3.select("#W"+d.warNum).attr("y"));
           
            testScene.forEach(function(d1){

                d1.scene.enabled(false)
            });
            console.log("SCENE -FALSE")


            $("body").animate(
                {scrollTop:yP},
                300,
                function(){

        // trying to solve weird timing issue -- it's grabbing the wrong war because of scrolling dispatch

                    setTimeout(function(){
                        $(window).one("scroll.setScene",function(){

                            console.log("SCENE -TRUE");
                            testScene.forEach(function(d1){

                                d1.scene.enabled(true)
                            });

                        });
                    },1000)

                }
            )


            // dispatch
            setTimeout(function(){
                dispatch.customHover(warName);}, 400)


        })

        .on("mouseout.tooltip",function(){
            tooltipBar.update("hide");
            d3.select(this).attr('stroke','none')
        })




//////-------------------------------------------------------------------------------------SCROLL TIMELINE CHART-------------//////



    plot.selectAll('.lines')
        .data(data)
        .enter()
        .append('rect').attr('class',function(d){return "lines W"+d.warNum;})
        .attr('x',function(d){return scaleXright(d.ccode)})
        .attr('y', function(d){return scaleYLines(d.startDate)})
        .attr('height',function(d){
            var length = scaleYLines(d.endDate) - scaleYLines(d.startDate);
            return length;
        })
        .attr('width', 7)
        .attr('fill','rgba(12,12,12,.1)')

        .on('click',function(d){
            var warName = d.war;
            dispatch.customHover(warName);
        })

        .on('mouseover',function(d,i){

            d3.select(this).attr('stroke','rgb(185,213,50)')
        
            var xP = this.getBoundingClientRect().left;
            var yP = document.getElementById("plot").offsetTop + parseFloat(d3.select("#plot").style("padding-top"))+parseFloat(d3.select(this).attr("y"))+200;

            tooltipRight.position(xP,yP,"top");
            tooltipRight.update("show",[
                "<strong>" + d.country + "</strong>",
                ""+d.war+"",
                "casualties: <strong>"+addComma(d.casualties)+"</strong>",
                "outcome: <strong class='backTT'>"+outcomeGroup[d.outcome]+"</strong>"  

            ]);

        })//END ON STATEMENT

        .on("mouseout.tooltip",function(){

            d3.select(this).attr('stroke','none')
            tooltipRight.update("hide");
        })
    

        .each(testScroll);



    // creates a scroll scene for each war


      function testScroll(data){
        var lineTarget = d3.select(this);
        var arrayTarget;
        warNumArray.forEach(function(d,i){
            if(lineTarget.datum().warNum==d.warNum){
                arrayTarget=i;
                return false;

            }
        });

        var tempNum = warNumArray[arrayTarget].warStartEle.warNum,
            tempCCode = warNumArray[arrayTarget].warStartEle.ccode;

        if((warNumArray[arrayTarget].hasScrollScene==false)&&(lineTarget.datum().warNum==tempNum)&&(lineTarget.datum().ccode==tempCCode)){

            testScene.push({
                "scene": new ScrollMagic.Scene({
                    triggerElement:lineTarget,
                    triggerHook:0.29,
                    duration: warNumArray[arrayTarget].sceneDuration
                })
                    .on("enter",function(event){

                        var warName = warNumArray[arrayTarget].WarName
                        dispatch.customHover(warName);

                    })
                    .addTo(controller),
                "warNum": data.warNum
            })

            lineTarget.attr("id",function(d){
                return "W"+d.warNum;
            });

            warNumArray[arrayTarget].hasScrollScene=true;

            }// END conditional

        }// END testScroll


//--------------------------------------------------------------------DISPATCH LISTENER------------------------////
    

    dispatch.on('customHover', function(warName){


// ------remove dashboard casualties green box and tooltip

        d3.selectAll('.dash').remove();
        tooltipLeft.update("hide");

// ------update lines on left and right
    
        d3.selectAll('.lines').style('fill',function(d){
        if( warName == d.war )
            return colorScale(d.outcome); 
        else if (warName ==d.WarName)
            return ('rgb(183,213,50');
        else return null;
            });

        // remove circle and circle text

        dashboard.selectAll('.nodes').remove();

        /// creating filtered data based on disptach event

        casualtiesByWar.filter(warName);
        var dataDispatch = casualtiesByWar.top(Infinity);


        /// appending new circles and text
    
        var nodes = dashboard.selectAll('.nodes')
            .data(dataDispatch)
            .enter()
            .insert('g','.casualtiesChart').attr('class','nodes')


//--CIRCLES


        var circles = nodes
            .insert('circle')
            .attr('cy', Dheight/2)
            .attr('cx', 200)
            .attr('r', function(d){ return d.r})
            .attr('stroke-dasharray',function(d){ if (d.outcome>=3){return '2,2'}})
            .attr('stroke',function(d){return colorScale(d.outcome)})
            .style("stroke-width", 2) 
            .attr('fill',function(d){return colorScaleFill(d.outcome)})


            .on("mouseenter",function(d){
                d3.select(this).attr('stroke','black')

                var xP = parseFloat(d3.select(this).attr("cx"))+parseFloat(d3.select("#mainDash").style("margin-left")),
                    yP = parseFloat(d3.select(this).attr("cy"));
                tooltipLeft.position(xP,yP,"right");

                tooltipLeft.update("show",[
                "<strong>" + d.country + "</strong>",
                ""+d.war+"",
                "casualties: <strong>"+addComma(d.casualties)+"</strong>",
                "outcome: <strong class='backTT'>"+outcomeGroup[d.outcome]+"</strong>"  
                ]);
                
            })
            .on("mouseleave",function(){
                d3.select(this).attr('stroke',function(d){return colorScale(d.outcome)})

                tooltipLeft.update("hide");
            });


//--TEXT LABELS


        var text = nodes
            .append('text').attr('class','countryLabel')
            .attr('cy', Dheight/2)
            .attr('cx', 200)
            .attr('fill','black')
            .attr('opacity',function(d){
                if (d.r >=18){return '1'}
                    else{return '0'}
            })
            .text(function(d){return d.country})

            .on("mouseenter",function(d){

                var xP = parseFloat(d3.select(this).attr("x"))+parseFloat(d3.select("#mainDash").style("margin-left")),
                    yP = parseFloat(d3.select(this).attr("y"));
                tooltipLeft.position(xP,yP,"right");

                tooltipLeft.update("show",[
                "<strong>" + d.country + "</strong>",
                ""+d.war+"",
                "casualties: <strong>"+addComma(d.casualties)+"</strong>",
                "outcome: <strong class='backTT'>"+outcomeGroup[d.outcome]+"</strong>"  
                ]);
                
            })
            .on("mouseleave",function(){
                tooltipLeft.update("hide");
            })

             .on("scroll",function(){
                tooltipLeft.update("hide");
            });


// force stuff       

    
        force.nodes(data)
            .on('tick',onForceTick)
            .start();
    
    
function onForceTick(e){
            var q = d3.geom.quadtree(dataDispatch),
                i = 0,
                n = dataDispatch.length;
    
            while( ++i<n ){
                q.visit(collide(dataDispatch[i]));
            }
        
            circles
                .each(function(d){
                    var focus = {};
                    focus.x = Dwidth*.25;
                    focus.y = Dheight*.5;
        
                    d.x += (focus.x-d.x)*(e.alpha*.1);
                    d.y += (focus.y-d.y)*(e.alpha*.1);
                })

               .attr('cy',function(d){return d.y})
               .attr('cx',function(d){return d.x})


            text
                .each(function(d){
                    var focus = {};
                    focus.x = Dwidth*.25;
                    focus.y = Dheight*.5;
        
                    d.x += (focus.x-d.x)*(e.alpha*.1);
                    d.y += (focus.y-d.y)*(e.alpha*.1);
                })
               .attr('y',function(d){return d.y})
               .attr('x',function(d){return d.x})
    
        function collide(dataPoint){
                var nr = dataPoint.r + 5,
                nx1 = dataPoint.x - nr,
                ny1 = dataPoint.y - nr,
                nx2 = dataPoint.x + nr,
                ny2 = dataPoint.y + nr;
    
                return function(quadPoint,x1,y1,x2,y2){
                    if(quadPoint.point && (quadPoint.point !== dataPoint)){
                        var x = dataPoint.x - quadPoint.point.x,
                            y = dataPoint.y - quadPoint.point.y,
                            l = Math.sqrt(x*x+y*y),
                            r = nr + quadPoint.point.r;
                        if(l<r){
                            l = (l-r)/l*.1;
                            dataPoint.x -= x*= l;
                            dataPoint.y -= y*= l;
                            quadPoint.point.x += x;
                            quadPoint.point.y += y;
                        }
                    }
                    return x1>nx2 || x2<nx1 || y1>ny2 || y2<ny1;
                }
            }// END collide
            
}//END onForceTick Function


//--- dashboard casualties (green tag thing)

d3.select('.buttonWarName').select('strong').html(warName)


        casualtiesChart.append('text')
            .attr('class','dash casLabels')
            .text('TOTAL CASUALTIES FOR EACH WAR')
            .attr('x',2)
            .attr('y',chartHeight+50)


    var casLabel = casualtiesChart.append('g')

    casLabel.selectAll('.labelRect')
            .data(warNumArray.filter(function(d){return d.casualties >=0000}))
            .enter()
            .append('rect').attr('class','dash labelRect')
            .attr('x',function(d,i){ return scaleX((i)*(barWidth+2)); })
            .attr('y',chartHeight+8)
            .attr('width',function(d){
                if(warName==d.WarName)
                    return 100;
            })
            .attr('height',22)
            .attr('fill','rgb(185,213,50)')


        casLabel.selectAll('text')
            .data(warNumArray.filter(function(d){return d.casualties >=0000}))
            .enter()
            .append('text')
            .attr('class','dash labels pointer')
            .text(function(d) {
                if (warName == d.WarName){
                    return addComma(d.casualties);
                }

            })
            .attr('x',function(d,i){ return scaleX((i)*(barWidth+2)+5); })
            .attr('fill','black')
            .attr('y',chartHeight+24)
            //.style('text-anchor','');
    });
   

}



/*---------------------------------------------------------region background stuff-------------*/

var regionW = document.getElementById('regionTitle').clientWidth
var regionH = document.getElementById('regionTitle').clientHeight


var plotRegion = d3.select('.regionTitle')
    .append('svg')
    .attr('width',width+margin.l+margin.r)
    .attr('height',height+margin.t+margin.b)
    .append('g')




plotRegion.append('rect')
        .attr('x',scaleXright(1))
        .attr('y',0)
        .attr('width',scaleXright(124))
        .attr('height',regionH)
        .attr('class','regionRect')

plotRegion.append('text')
        .attr('x',scaleXright(3))
        .attr('y',regionH*.02)
        .text('NA').attr('class','regionLabels')

plotRegion.append('rect')
        .attr('x',scaleXright(10))
        .attr('y',0)
        .attr('width',2)
        .attr('height',regionH)
        .attr('class','regionRectLine')


plotRegion.append('text')
        .attr('x',scaleXright(14))
        .attr('y',regionH*.02)
        .text('SA').attr('class','regionLabels')

plotRegion.append('rect')
        .attr('x',scaleXright(21))
        .attr('y',0)
        .attr('width',2)
        .attr('height',regionH)
        .attr('class','regionRectLine')

plotRegion.append('text')
        .attr('x',scaleXright(41))
        .attr('y',regionH*.02)
        .text('EU').attr('class','regionLabels')

plotRegion.append('rect')
        .attr('x',scaleXright(65))
        .attr('y',0)
        .attr('width',2)
        .attr('height',regionH)
        .attr('class','regionRectLine')

plotRegion.append('text')
        .attr('x',scaleXright(71))
        .attr('y',regionH*.02)
        .text('AF').attr('class','regionLabels')

plotRegion.append('rect')
        .attr('x',scaleXright(80))
        .attr('y',0)
        .attr('width',2)
        .attr('height',regionH)
        .attr('class','regionRectLine')

plotRegion.append('text')
        .attr('x',scaleXright(89))
        .attr('y',regionH*.02)
        .text('ME').attr('class','regionLabels')

plotRegion.append('rect')
        .attr('x',scaleXright(102))
        .attr('y',0)
        .attr('width',2)
        .attr('height',regionH)
        .attr('class','regionRectLine')

plotRegion.append('text')
        .attr('x',scaleXright(111))
        .attr('y',regionH*.02)
        .text('AS').attr('class','regionLabels')




//--- freeze region div at top of screen


  var $window = $(window),
       $stickyEl = $('#regionTitle'),
       elTop = $stickyEl.offset().top;

   $window.scroll(function() {
        $stickyEl.toggleClass('sticky', $window.scrollTop() > elTop);
    });




/* ---------legend----------*/

dashboard.append('text')
    .attr('x','30.5%')
    .attr('y','80%')
    .text('Circle size = # of casualties')
    .attr('class','keyLabels')

dashboard.append('text')
    .attr('x','32%')
    .attr('y','83.5%')
    .text('Won')
    .attr('class','keyLabels')

dashboard.append('text')
    .attr('x','36.5%')
    .attr('y','83.5%')
    .text('Lost')
    .attr('class','keyLabels')


dashboard.append('text')
    .attr('x','41%')
    .attr('y','83.5%')
    .text('Other')
    .attr('class','keyLabels')




dashboard.append('circle')
    .attr('cx','31%')
    .attr('cy','83%')
    .attr('r','8')
    .attr('fill','none')
    .attr('stroke','black');


dashboard.append('circle')
    .attr('cx','35.5%')
    .attr('cy','83%')
    .attr('r','8')
    .attr('fill','rgb(245,245,245)')
    .attr('stroke','rgba(134,134,134,1)');


dashboard.append('circle')
    .attr('cx','40%')
    .attr('cy','83%')
    .attr('r','8')
    .attr('fill','none')
    .attr('stroke','rgba(134,134,134,1)')
    .attr('stroke-dasharray','2,2')



dashboard.append('text')
    .attr('x','40')
    .attr('y','3%')
    .text('^ more than a million casualties')
    .attr('class','keyLabels')


/*---------------------------------------------instructions-----------*/





var instructions = d3.select('.instructions').select('p')
.html("Each line represents the duration a country and/or state was involved in a war. Scrolling over each one (like a music box) will highlight all the states associated with that war and profile the war to the left.");
 

d3.select('.instructions').style('left', '42%')
    .style('top', '17%');   





/*---------------------------------------------Parse-----------*/

function parse(d){

    return{

        // x: Dwidth/2,
        // y: Dheight/2,
        country: d.StateName,
        ccode: +d.newccode,
        initiator: d.Initiator,
        length: d.Length,
        war: d.WarName,
        warNum: d.WarNum,
        start: +d.StartYear1,
        casualties: +d.BatDeath,
        r: scaleR(+d.BatDeath),
        outcome: +d.Outcome,
        location: d.WhereFought,
        startDate: new Date(+d.StartYear1, + d.StartMonth1-1, + d.StartDay1),
        endDate: new Date(+d.EndYear1, + d.EndMonth1-1, + d.EndDay1),
    }
}

