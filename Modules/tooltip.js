d3.customTooltip = function(){

    var tooltipClass = "module-tooltip",
        tooltipStyle = {
            width: "150px",
            height: "auto",
            position: "fixed",
            top: "0px",
            left: "0px",
            "background-color": "rgba(178, 178, 178, 0.85)",
            "pointer-events": "none",
            opacity:0
        },
        x = 0,
        y = 0,
        paraCount = 1,
        tPos = "none";




    function tooltip(_selection){
        var tooltipContainer = _selection.append("div")
            .style(tooltipStyle)
            .attr("class",tooltipClass);

        for(var i = 0; i <paraCount;i++)
        {
            tooltipContainer
                .append("p")
                .attr("class","tooltipText labels")
                .text("0");
        }

    }


    tooltip.classTag = function(_t){
        if(!arguments.length) return tooltipClass;
        tooltipClass = _t;
        return tooltip;
    };

    tooltip.style =function(style,value){
        if(!arguments.length) return tooltipStyle;
        tooltipStyle[style] = value;
        return tooltip;
    };

    tooltip.paragraph = function(num){
        if(!arguments) return paraCount;
        paraCount = num;
        return tooltip;
    }

    //update data showing
    tooltip.update = function(state,content){
        if(!arguments.length){
            throw "cannot update without data";
        }
        else{
            if(!content);
            else{
                d3.selectAll("."+tooltipClass+" .tooltipText")
                    .data(content)
                    .html(function(d){
                        return d
                    })
            }
            if(state=="show"){
                if(tPos=="top"){
                    x -= parseFloat(d3.select("."+tooltipClass).style("width"))/2;
                    y -= parseFloat(d3.select("."+tooltipClass).style("height"))+10;
                }
                else if(tPos=="right"){
                    x+=50;
                    y-=parseFloat(d3.select("."+tooltipClass).style("height"))/2;
                }
                else{

                }
                d3.selectAll("."+tooltipClass).transition().style({
                    left: x+"px",
                    top: y+"px",
                    opacity:"1"
                });
            }
            if(state=="hide"){
                //d3.selectAll("."+tooltipClass).style("display","none");
                d3.selectAll("."+tooltipClass).transition().style("opacity","0");
            }

        }
        return tooltip;
    };

    //update position
    tooltip.position=function(_x,_y,_tPos){
        if(!arguments.length) return x+","+y+" "+tPos;
        x=_x;
        y=_y;
        tPos=_tPos;
        return tooltip;
    }




    return tooltip;
}