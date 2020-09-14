// code originated from https://bl.ocks.org/maegul/7d8e7342c649fdc077a6984e52da4b62
// helpful: http://bl.ocks.org/nbremer/7658623
// also helpful: https://github.com/vlandham/bubble_chart

async function drawPlot() {
    const data = await d3.csv("wide_data.csv")
    let keys = Object.keys(data[1]).splice(1)
    const rAccessor = d => d.ladder_score
    const colorAccessor = d => d.ladder_score
    //! set page dimensions
    let dimensions = {
        width: window.innerWidth * 0.9,
        height: window.innerHeight * 0.9,
        margin: {
            top: 10,
            right: 10,
            bottom: 50,
            left: 50
        },
    }
    dimensions.boundedWidth = dimensions.width -
        dimensions.margin.left -
        dimensions.margin.right
    dimensions.boundedHeight = dimensions.height -
        dimensions.margin.top -
        dimensions.margin.bottom

    //! draw canvas
    const svg = d3.select('#wrapper')
        .append('svg')
        .attr('width', dimensions.width)
        .attr('height', dimensions.height)
    const bounds = svg.append("g")
        .style("transform", `translate(${
          dimensions.margin.left
        }px, ${
          dimensions.margin.top
        }px)`)

    // create scales
    // let selected_variable = keys[0]


    //* radius
    let radiusScale = d3.scaleLinear()
        .domain(d3.extent(data, rAccessor))
        .range([5, 12])
    //* color
    const colorScale = d3.scaleLinear()
        .domain(d3.extent(data, colorAccessor))
        .range(["skyblue", "darkslategrey"])

    //https://observablehq.com/@d3/d3-scalelinear
    let xScale = d3.scaleLinear()

        .rangeRound([dimensions.margin.left, dimensions.boundedWidth])
    // set domain for selected variable

    xScale.domain(d3.extent(data, d => d.ladder_score))
    //! plot data
    // a function to highlight points when clicked
    let toggleHighlight = (function () {
        let current_stroke_width = 0.1
        let current_stroke = "red"

        return function () {
            current_stroke_width = current_stroke_width == 0.5 ? 3 : 0.5
            current_stroke = current_stroke == "black" ? "#C40320" : "black"
            d3.select(this).style("stroke-width", current_stroke_width)
                .style("stroke", current_stroke);
        }
    })();
    let circles = bounds.selectAll('.circle')
        .data(data)
        .join('circle')
        .classed('circ', true)
        .attr('r', d => radiusScale(d.ladder_score))
        .attr('cx', d => xScale(d.ladder_score))
        .attr('cy', dimensions.height / 2)
        .attr("fill", d => colorScale(colorAccessor(d)))
        .attr("stroke", "black")
        .attr("stroke-width", 0.5)
        .on('click', toggleHighlight)
    //! tooltip
    //https://observablehq.com/@d3/d3v6-migration-guide#events
    circles.on("mouseover", function (event, d) {
            //* 把鼠标放上面时候的圈圈
            d3.select(this)
                .attr("stroke", "black")
                .attr("stroke-width", 3);

            //* tooltip position
            d3.select("#prettytooltip")
                //? event.pageX/Y locates mouse position
                //       px distance from left edge of svg
                .style("left", (event.pageX) + "px")
                //       px distance from top edge of svg
                .style("top", (event.pageY - 90) + "px")
                // 			 update value for label box
                .select("#country")
                .text(d.country_name)
            d3.select("#prettytooltip")
                .select("#value")
                .text(d.ladder_score);
            //* 改变事物前缀
            // d3.select("#prettytooltip")
            //     .select("#pretty_variable")
            //     .text(pretty_variable);
            //     //* 如百分号, years
            // d3.select("#prettytooltip")
            //     .select("#post_symbol")
            //     .text(post_symbol);
            //     //* 如$
            // d3.select("#prettytooltip")
            //     .select("#pre_symbol")
            //     .text(pre_symbol);

            //Show the tooltip
            d3.select("#prettytooltip").classed("hidden", false);

        })
        .on("mouseout", function (event, d) {

            //Hide the tooltip
            d3.select("#prettytooltip").classed("hidden", true);
            d3.select(this)
                .attr("fill", d => colorScale(d.ladder_score))
                .attr("stroke", "black")
                .attr("stroke-width", 0.5)
                .attr("r", d => radiusScale(d.ladder_score));

        })

    //! avoid overplotting
    let simulation = d3.forceSimulation(data)
        .force('x', d3.forceX(d => xScale(d.ladder_score)))
        .force('y', d3.forceY(dimensions.height / 2)
            .strength(0.03)
        )
        .force('collide', d3.forceCollide(function (d) {
                return radiusScale(d.ladder_score)
            })
            .strength(0.9))
        .alpha(0.01)
        .alphaTarget(0.3)
        .alphaDecay(0.1)
        .on('tick', d => d3.selectAll('.circ')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
        )
    //! button transition
    const selected_variable_scaled = 'ladder_score'
    d3.selectAll('.d_sel').on('click', function (d, i) {

        console.log("aaa")

        let selected_variable = this.value;
        selected_variable_scaled = this.value + '_scaled';

        simulation.force('x', d3.forceX(function (d) {
            return xScale(d[selected_variable_scaled])
        }))
    })

    //! buttons
    const buttons = d3.selectAll('#buttons')
    for (let i = 0; i < 9; i++) {
        buttons.append('button')
            .text(`${keys[i]}`)
            .style("font-size", "10px")
            .style("font-family", "Helvetica Neue")
            .style("padding", "8px")
            .style("color", "#454545")
            .style("text-shadow", "0 1px 2px rgba(0, 0, 0, 0.25)")
            .style("background", "#ecf0f1")
            .style("border", "2px solid white")
            .style("cursor", "pointer")
            .style("-webkit-box-shadow", "inset 0 -2px #dadedf")
            .style("box-shadow", "inset 0 -2px #dadedf")
            .attr('value', `${keys[i]}`)
            .classed('d_sel', true)
            .on("mouseover", function (d) {
                d3.select(this)
                    .style("background", "orange")
                    .style("color", "white")
            })
            .on("mouseout", function (d) {
                d3.select(this)
                    .style("background", "#ecf0f1")
                    .style("color", "#454545")
            })

    }
}

drawPlot()