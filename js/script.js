const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';

let data = undefined;
let xAxisScale = undefined;
let yAxisScale = undefined;

const width = 800;
const height = 600;
const padding = 40;

const color = d3.scaleOrdinal(d3.schemeCategory10);

// svg selection using d3 
const svg = d3.select('svg')

const createGraphArea = () => {
    svg.attr('width', width)
    svg.attr('height', height)
    svg.style('background-color', 'black')
}

const createScales = () => {

    xAxisScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.Year) - 1, d3.max(data, d => d.Year) + 1])
        .range([padding, width - padding])


    // data.Time to new Date()
    data.forEach(function (d) {
        d.Place = +d.Place;
        var parsedTime = d.Time.split(":");
        d.Time = new Date(1970, 0, 1, 0, parsedTime[0], parsedTime[1]);
    });


    yAxisScale = d3.scaleTime()
        .domain(
            d3.extent(data, function (d) {
                return d.Time;
            })
        )
        .range([padding, height - padding])
}


const createAxis = () => {
    const xAxis = d3.axisBottom(xAxisScale)
        .tickFormat(d3.format('d'))

    const yAxis = d3.axisLeft(yAxisScale)
        .tickFormat(d3.timeFormat('%M:%S'))

    svg.append('g')
        .call(xAxis)
        .attr('id', 'x-axis')
        .style('color', 'white')
        .attr('transform', 'translate(0,' + (height - padding) + ')')

    svg.append('g')
        .call(yAxis)
        .attr('id', 'y-axis')
        .style('color', 'white')
        .attr('transform', 'translate(' + padding + ',0)')
}


const createDots = () => {
    let tooltip = d3.select('body')
        .append('div')
        .attr('id', 'tooltip')
        .attr('class', 'tooltip')
        .style('opacity', 0);

    svg.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('r', '7')
        .attr('data-xvalue', d => d.Year)
        .attr('data-yvalue', d => d.Time.toISOString())
        .attr('cx', d => xAxisScale(d.Year))
        .attr('cy', d => yAxisScale(d.Time))
        .style('fill', function (d) {
            return color(d.Doping !== '');
        })
        .on('mouseover', function (d) {

            tooltip.style('opacity', 0.9);
            tooltip.attr('data-year', d.target.__data__.Year);
            tooltip
                .html(
                    d.target.__data__.Name +
                    ': ' +
                    d.target.__data__.Nationality +
                    '<br/>' +
                    'Year: ' +
                    d.target.__data__.Year +
                    ', Time: ' +
                    new Date(d.target.__data__.Time).getMinutes() +
                    (d.target.__data__.Doping ? '<br/><br/>' + d.target.__data__.Doping : '')
                )
                .style('left', d.pageX + 15 + 'px')
                .style('top', d.pageY - 28 + 'px');
        })
        .on('mouseout', function () {
            tooltip.style('opacity', 0);
        });
    // .attr('fill', 'red')
}

// fetching data from api 
fetch(url)
    .then(res => res.json())
    .then(res => {
        data = res;
        console.log(data)

        createGraphArea();
        createScales();
        createAxis();
        createDots();
    })