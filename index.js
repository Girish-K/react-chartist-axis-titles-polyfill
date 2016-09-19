(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['chartist'], function (chartist) {
            return (root.returnExportsGlobal = factory(chartist));
        });
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory(require('chartist'));
    } else {
        root['Chartist'] = factory(root.chartist);
    }
}(this, function (Chartist) {
	(function(){
    /**
     * [function that updates alphaNumerate function of chartist]
     */
     		(function(Chartist) {
    			Chartist.alphaNumerate = function(number){
            var stringForm = '';
            while(number >= 0){
                stringForm = String.fromCharCode(97 + number % 26) + stringForm;
                if(number >= 26){
                  number = parseInt(number / 26) - 1;
                }else{
                  number = -1;
                }
            }
            return stringForm;
          };
        }(Chartist));
		/**
		 * [function that acts as a polyfill to display axis titles for chartist graphs ]
		 */
		(function() {
			(function(window, document, Chartist) {
				'use strict';
				var axisDefaults = {
					axisTitle: '',
					axisClass: 'ct-axis-title',
					offset: {
						x: 0,
						y: 0
					},
					textAnchor: 'middle',
					flipText: false
				};
				var defaultOptions = {
					xAxis: axisDefaults,
					yAxis: axisDefaults
				};
				Chartist.plugins = Chartist.plugins || {};
				Chartist.plugins.ctAxisTitle = function(options) {
					options = Chartist.extend({}, defaultOptions, options);
					return function ctAxisTitle(chart) {
						chart.on('created', function(data) {
							if(!options.axisX.axisTitle && !options.axisY.axisTitle) {
								throw new Error('ctAxisTitle plugin - You must provide at least one axis title');
							} else if(!data.axisX && !data.axisY) {
								throw new Error('ctAxisTitle plugin can only be used on charts that have at least one axis');
							}
							var xPos;
							var yPos;
							var title;
							//position axis X title
							if(options.axisX.axisTitle && data.axisX) {
								xPos = (data.axisX.axisLength / 2) + data.options.axisY.offset + data.options.chartPadding.left;
								yPos = data.options.chartPadding.top;
								if(data.options.axisY.position === 'end') {
									xPos -= data.options.axisY.offset;
								}
								if(data.options.axisX.position === 'end') {
									yPos += data.axisY.axisLength;
								}
								title = new Chartist.Svg("text");
								title.addClass(options.axisX.axisClass);
								title.text(options.axisX.axisTitle);
								title.attr({
									x: xPos + options.axisX.offset.x,
									y: yPos + options.axisX.offset.y,
									"text-anchor": options.axisX.textAnchor
								});
								data.svg.append(title, true);
							}
							//position axis Y title
							if(options.axisY.axisTitle && data.axisY) {
								xPos = 0;
								yPos = (data.axisY.axisLength / 2) + data.options.chartPadding.top;
								if(data.options.axisX.position === 'start') {
									yPos += data.options.axisX.offset;
								}
								if(data.options.axisY.position === 'end') {
									xPos = data.axisX.axisLength;
								}
								var transform = 'rotate(' + (options.axisY.flipTitle ? -90 : 90) + ', ' + xPos + ', ' + yPos + ')';
								title = new Chartist.Svg("text");
								title.addClass(options.axisY.axisClass);
								title.text(options.axisY.axisTitle);
								title.attr({
									x: xPos + options.axisY.offset.x,
									y: yPos + options.axisY.offset.y,
									transform: transform,
									"text-anchor": options.axisY.textAnchor
								});
								data.svg.append(title, true);
							}
						});
					};
				};
			}(window, document, Chartist));
			return Chartist.plugins.ctAxisTitle;
		}());

		/**
		 * [function that acts as a polyfill to display legends for chartist pie graphs ]
		 */
		(function(Chartist) {
			'use strict';
			var defaultOptions = {
				className: '',
				legendNames: false,
				clickable: true,
				onClick: null
			};
			Chartist.plugins = Chartist.plugins || {};
			Chartist.plugins.legend = function(options) {
				options = Chartist.extend({}, defaultOptions, options);
				return function legend(chart) {
					var existingLegendElement = chart.container.querySelector('.ct-legend');
					if(existingLegendElement) {
						// Clear legend if already existing.
						existingLegendElement.parentNode.removeChild(existingLegendElement);
					}
					// Set a unique className for each series so that when a series is removed,
					// the other series still have the same color.
					if(options.enabledToggleSeriesOnLegendClick) {
						var newSeries = chart.data.series.map(function(series, seriesIndex) {
							if(typeof series !== 'object') {
								series = {
									value: series
								};
							}
							series.className = series.className || chart.options.classNames.series + '-' + Chartist.alphaNumerate(seriesIndex);
							return series;
						});
						chart.data.series = newSeries;
					}
					var legendElement = document.createElement('ul'),
						isPieChart = chart instanceof Chartist.Pie;
					legendElement.className = 'ct-legend';
					if(chart instanceof Chartist.Pie) {
						legendElement.classList.add('ct-legend-inside');
					}
					if(typeof options.className === 'string' && options.className.length > 0) {
						legendElement.classList.add(options.className);
					}
					var removedSeries = [],
						originalSeries = chart.data.series.slice(0);
					// Get the right array to use for generating the legend.
					var legendNames = chart.data.series,
						useLabels = isPieChart && chart.data.labels;
					if(useLabels) {
						var originalLabels = chart.data.labels.slice(0);
						legendNames = chart.data.labels;
					}
					legendNames = options.legendNames || legendNames;
					// Loop through all legends to set each name in a list item.
					legendNames.forEach(function(legend, i) {
						var li = document.createElement('li');
						li.className = 'ct-series-' + i;
						li.setAttribute('data-legend', i);
						li.textContent = legend.name || legend;
						legendElement.appendChild(li);
					});
					chart.container.appendChild(legendElement);
					if(options.highlightSeriesOnLegendHover) {
						legendElement.addEventListener('mouseover', function(e) {
							var li = e.target;
							if(li.parentNode !== legendElement || !li.hasAttribute('data-legend')) return;
							e.preventDefault();
							var selectedSeriesIndex = parseInt(li.getAttribute('data-legend'));
							// Reset the series to original and remove each series that
							// is still removed again, to remain index order.
							var seriesCopy = originalSeries.map(function(series, seriesIndex) {
                if(seriesIndex === selectedSeriesIndex){
                  if(typeof series !== 'object') {
                    series = {
                      value: series
                    };
                  }
                  series.className = series.className || chart.options.classNames.series + '-' + Chartist.alphaNumerate(seriesIndex) + ' hightlight-legend';
                }
  							return series;
  						});
							if(useLabels) {
								var labelsCopy = originalLabels.slice(0);
							}
							chart.data.series = seriesCopy;
							if(useLabels) {
								chart.data.labels = labelsCopy;
							}
							chart.update();
						});

            legendElement.addEventListener('mouseout', function(e) {
							var li = e.target;
							if(li.parentNode !== legendElement || !li.hasAttribute('data-legend')) return;
							e.preventDefault();
							var selectedSeriesIndex = parseInt(li.getAttribute('data-legend'));
							// Reset the series to original and remove each series that
							// is still removed again, to remain index order.
							var seriesCopy = originalSeries.map(function(series, seriesIndex) {
                if(seriesIndex === selectedSeriesIndex){
                  if(typeof series !== 'object') {
                    series = {
                      value: series
                    };
                  }
                  series.className = series.className || chart.options.classNames.series + '-' + Chartist.alphaNumerate(seriesIndex) ;
                }
  							return series;
  						});
							if(useLabels) {
								var labelsCopy = originalLabels.slice(0);
							}
							chart.data.series = seriesCopy;
							if(useLabels) {
								chart.data.labels = labelsCopy;
							}
							chart.update();
						});

					}else if(options.enabledToggleSeriesOnLegendClick){
            legendElement.addEventListener('click', function(e) {
  							var li = e.target;
  							if(li.parentNode !== legendElement || !li.hasAttribute('data-legend')) return;
  							e.preventDefault();
  							var seriesIndex = parseInt(li.getAttribute('data-legend')),
  								removedSeriesIndex = removedSeries.indexOf(seriesIndex);
  							if(removedSeriesIndex > -1) {
  								// Add to series again.
  								removedSeries.splice(removedSeriesIndex, 1);
  								li.classList.remove('inactive');
  							} else {
  								// Remove from series, only if a minimum of one series is still visible.
  								if(chart.data.series.length > 1) {
  									removedSeries.push(seriesIndex);
  									li.classList.add('inactive');
  								}
  							}
  							// Reset the series to original and remove each series that
  							// is still removed again, to remain index order.
  							var seriesCopy = originalSeries.slice(0);
  							if(useLabels) {
  								var labelsCopy = originalLabels.slice(0);
  							}
  							// Reverse sort the removedSeries to prevent removing the wrong index.
  							removedSeries.sort().reverse();
  							removedSeries.forEach(function(series) {
  								seriesCopy.splice(series, 1);
  								if(useLabels) {
  									labelsCopy.splice(series, 1);
  								}
  							});
  							if(options.onClick) {
  								options.onClick(chart, e);
  							}
  							chart.data.series = seriesCopy;
  							if(useLabels) {
  								chart.data.labels = labelsCopy;
  							}
  							chart.update();
  						});
          }
				};
			};
			return Chartist.plugins.legend;
		}(Chartist));
	})();
}));

