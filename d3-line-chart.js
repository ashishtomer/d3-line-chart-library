var $_lineChart = (function() {

	var _lineChart = {},
	_width = 1000, _height = 600,
	_xMax, _xMin, _yMax, _yMin,
	_svg, _xScale, _yScale,
	_chartKeys = [],
	_colors = d3.scale.category10(),
    _margins = {
		top: 20,
		right: 50,
	 	bottom: 30,
	 	left: 50
	};

	var renderAxes = function(svg) {

		var axesGroup = svg.append('g')
			.classed('axes', true);

		var xAxis = d3.svg.axis()
			.scale(_xScale)
			.orient('bottom')
			.ticks(Math.abs((_xMax - _xMin)/100));

		var yAxis = d3.svg.axis()
			.scale(_yScale)
			.orient('left')
			.ticks(Math.abs((_yMax - _yMin)/100));

		axesGroup.append('g')
			.attr('transform', function() {
				return 'translate(' + _margins.left + ', ' + (_height - _margins.bottom) + ')';
			})
			.classed('x-axis', true)
			.style({
				'fill': 'none',
				'stroke-width': '1',
				'shape-rendering': 'crispedges',
				'stroke': '#fff'
			})
			.call(xAxis);

		axesGroup.append('g')
			.attr('transform', function() {
				return 'translate(' + _margins.left + ', ' + (_height - _margins.bottom) + ')';
			})
			.classed('x-axis-minor', true)
			.style({
				'fill': 'none',
				'stroke-width': '1',
				'shape-rendering': 'crispedges',
				'stroke': '#fff'
			})
			.call(
				xAxis.ticks(Math.abs((_xMax - _xMin)/100)*2)
					.tickSize(3)
					.tickFormat(function(v){
						return '';
					})
			);

		axesGroup.append('g')
			.attr('transform', function() {
				return 'translate(' + _margins.left + ', ' + _margins.top + ')';
			})
			.classed('y-axis', true)
			.style({
				'fill': 'none',
				'stroke-width': '1',
				'shape-rendering': 'crispedges',
				'stroke': '#fff'
			})
			.call(yAxis);

		axesGroup.append('g')
			.attr('transform', function() {
				return 'translate(' + _margins.left + ', ' + _margins.top + ')';
			})
			.classed('y-axis-minor', true)
			.style({
				'fill': 'none',
				'stroke-width': '1',
				'shape-rendering': 'crispedges',
				'stroke': '#fff'
			})
			.call(yAxis.ticks(Math.abs((_xMax - _xMin)/100)*2)
					.tickSize(3)
					.tickFormat(function(v){
						return '';
					}));

		d3.selectAll('g.x-axis-minor .tick')
			.append('line')
			.attr('x0', 0)
			.attr('y0', 0)
			.attr('x1', 0)
			.attr('y1', -(_height - _margins.top - _margins.bottom))
			.style({
				'stroke': '#bb2',
				'opacity': '0.1'
			});

		d3.selectAll('g.y-axis-minor .tick')
			.append('line')
			.attr('x0', 0)
			.attr('y0', 0)
			.attr('x1', (_width - _margins.left - _margins.right))
			.attr('y1', 0)
			.style({
				'stroke': '#bb2',
				'opacity': '0.1'
			});
	}

	var renderPoints = function(svg, data) {

		var _xScale = d3.scale.linear()
			.domain([_xMin, _xMax])
			.range([_margins.left, _width - _margins.right]);

		var _yScale = d3.scale.linear()
			.domain([_yMin, _yMax])
			.range([ _height - _margins.bottom, _margins.top])

		var i = 0;
		data.map(function(dataset) {
			svg.selectAll('circle.data-point' + i)
				.data(dataset)
				.enter()
					.append('circle')
					.attr('class', 'data-point' + i)
					.attr('cx', function(d) {
						return _xScale(d[_chartKeys[i][0]]);
					})
					.attr('cy', function(d) {
						return _yScale(d[_chartKeys[i][1]]);
					})
					.attr('r', function() {
						return 2;
					})
					.style({
						'stroke': _colors(i),
						'stroke-width': '2',
						'fill' : '#dd2ee2',
						'font-size': '10px'
					})
					.on('mouseover', function(d) {
						var keys = [];
						for(key in this.__data__) {
							keys.push(key);
						}

						svg.append('text')
							.classed('point-text', true)
							.text('(' + d[keys[0]] + ',' + d[keys[1]] + ')')
							.transition()
							.duration(100)
							.style({
								'font-size': '10px',
								'fill': '#fff',
								'shape-rendering': 'crispedges',
								'opacity': '1'
							})
							.attr('x', _xScale(d[keys[0]]) - 10)
							.attr('y', _yScale(d[keys[1]]) - 10)
							.each('end', function() {
								var element = this;
								setTimeout(function() {d3.select(element).remove()}, 1000);
							});
					});
			i++;
		});
	};

	var populateMinMax = function(data) {				
		var xValues = [];				
		var yValues = [];

		data.map(function(dataset){
			var temp = [];

			for(key in dataset[0]) {
				temp.push(key);
			}

			_chartKeys.push(temp);

			xValues = xValues.concat(dataset.map(function(o) {return o[temp[0]]}));
		 	yValues = yValues.concat(dataset.map(function(o) {return o[temp[1]]}));	
		});

		console.log(xValues.sort(function(a, b) { if (a < b) return a;}));

		_xMax = xValues.sort(function(a, b) { return a < b ;})[0];
		_xMin = xValues.sort(function(a, b) { return a > b;})[0];
		_yMax = yValues.sort(function(a, b) { return a < b;})[0];
		_yMin = yValues.sort(function(a, b) { return a > b;})[0];

		console.log(_yMax);
	}

	var renderLines = function(svg, data) {
		var _xScale = d3.scale.linear()
			.domain([_xMin, _xMax])
			.range([_margins.left, _width - _margins.right]);

		var _yScale = d3.scale.linear()
			.domain([_yMin, _yMax])
			.range([ _height - _margins.bottom, _margins.top]);

		function generateLinePoints(d, i) {
			var line = d3.svg.line()
				.interpolate('monotone')
				.x(function(d) {
					return _xScale(d[_chartKeys[i][0]]);
				})
				.y(function(d) {
					return _yScale(d[_chartKeys[i][1]]);
				})
			return line(d);
		}
		

		var i = 0;
		data.map(function(dataset){
			svg.selectAll('path.line' + i)
				.data([dataset])
				.enter()
					.append('path')
					.attr('class', 'line' + i)
					.attr('d', function(d) {
						return generateLinePoints(d, i);
					})
					.style({
						'fill': 'none',
						'stroke-width': '2',
						'stroke': _colors(i),
						'opacity' : '0.7'
					});
			i++;
		});

	};

	function renderAreas(svg, data) {
        var area = d3.svg.area() // <-A
                    .x(function(d) { return _xScale(d[0]); })
                    .y0(0)
                    .y1(function(d) { return _yScale(d[1]); });

        svg.selectAll("path.area")
                .data([data])
                .enter() // <-B
                .append("path")
                .style("fill", function (d, i) {
                    return _colors(i);
                })
                .attr("class", "area");

        svg.selectAll("path.area")
                .data(data)
                .transition() // <-D
                .attr("d", function (d) {
                    return area(data); // <-E
                });
    }

	_lineChart.render = function(div, ...data) {

		var heightInPx, widthInPx;
		var divId = div.substring(div.indexOf('#') + 1);

		try {
			heightInPx = window.getComputedStyle(document.getElementById(divId), null)
				.getPropertyValue('height');
		} catch(e) {
			heightInPx = document.getElementById(divId).currentStyle.height;
		}

		try {
			widthInPx = window.getComputedStyle(document.getElementById(divId), null)
				.getPropertyValue('width');
		} catch(e) {
			widthInPx = document.getElementById(divId).currentStyle.width;
		}

		_height = parseInt(heightInPx.substring(0, heightInPx.indexOf('px')));
		_width = parseInt(widthInPx.substring(0, widthInPx.indexOf('px')));

		var svg = d3.select(div)
			.append('svg')
			.attr('height', _height)
			.attr('width', _width);

		populateMinMax(data);

		_xScale = d3.scale.linear()
			.domain([_xMin, _xMax])
			.range([0, _width - _margins.left - _margins.right]);

		var scale = d3.scale.linear()
			.domain([0, 1000])
			.range([0, 5000])

		console.log('_xMin: ' + _xMin)
		console.log('_xMax: ' + _xMax)
		console.log('scaled _xMin: ' + scale(1));

		_yScale = d3.scale.linear()
			.domain([_yMin, _yMax])
			.range([_height - _margins.top - _margins.bottom, 0]);

		renderAxes(svg);
		renderPoints(svg, data);
		renderLines(svg, data);
		renderAreas(svg, data[0]);
	}

	return _lineChart;
})();