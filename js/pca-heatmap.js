
function drawCircos(error, genes, combinedResults, ppiPredictions) {
  var width = 750;//document.getElementsByClassName('mdl-card__supporting-text')[0].offsetWidth
  var circosHeatmap = new Circos({
        container: '#heatmapChart',
        width: width,
        height: width
    });

  NESs = []
  $.each(combinedResults, function(i, elem) { NESs.push(Math.abs(elem.nes)); });
  maxNES = Math.max.apply(null, NESs);

  MOAs = []
  $.each(combinedResults, function(i, elem) { MOAs.push(Math.abs(elem.moa)); });
  maxMOA = Math.max.apply(null, MOAs);

    blackBg = combinedResults.map(function(d) {
      return {
        block_id: d.gene_symbol,
        start: 0,
        end: 11,
        value: 1
      };
    })
    whiteBg = combinedResults.map(function(d) {
      return {
        block_id: d.gene_symbol,
        start: 0,
        end: 11,
        value: 0
      };
    })
    NES = combinedResults.map(function(d) {
      return {
        block_id: d.gene_symbol,
        start: 0,
        end: 11,
        value: parseFloat(d.nes)
      };
    })
    MOA = combinedResults.map(function(d) {
      return {
        block_id: d.gene_symbol,
        start: 0,
        end: 11,
        value: parseFloat(d.moa)
      };
    })
    geneSymbol = combinedResults.map(function(d) {
      return {
        block_id: d.gene_symbol,
        position: 7,
        value: d.gene_symbol
      };
    })
    drugCounts = combinedResults.map(function(d) {
      return {
        block_id: d.gene_symbol,
        start: 0,
        end: 11,
        value: parseInt(d.drugs),
        label: d.drug_labels
      };
    })
    PPI = ppiPredictions.map(function (d) {
      return {
        source: {
          id: d.gene_symbol_a,
          start: parseInt(d.a_start),
          end: parseInt(d.a_end)
        },
        target: {
          id: d.gene_symbol_b,
          start: parseInt(d.b_start),
          end: parseInt(d.b_end)
        },
        value: d.prob
      }
    })
    console.log(PPI);
    circosHeatmap
      .layout(
        genes,
        {
          innerRadius: width / 2 - 195,
          outerRadius: width / 2 - 195,
          ticks: {display: false},
          gap: 0,
          labels: {
            position: 'center',
            display: false,
            size: 14,
            color: '#000',
            radialOffset: 1
          }
        }
      )
      .chords('PPI', PPI, {
        radius: 0.99,
        color: 'OrRd',
        min: 0.9,
        tooltipContent: function (d) {
          return d.source.id + ' ➤ ' + d.target.id + '<br>PrePPI p = ' + d.value
        }
      })
      .heatmap('blackBg', blackBg, {
        innerRadius: 0.99,
        outerRadius: 1.35,
        color: 'Greys',
        min: 0,
        max: 1,
      })
      .heatmap('whiteBg', whiteBg, {
        innerRadius: 0.99,
        outerRadius: 1.35,
        color: 'Greys',
        min: 0,
        max: 1,
      })
      .heatmap('NES', NES, {
        innerRadius: 1.35,
        outerRadius: 1.70,
        logScale: false,
        color: 'PuOr',
        min: -maxNES,
        max: maxNES,
        tooltipContent: function (d) {
          return d.block_id+' | Resistant vs. Residual LNCaP<br>VIPER Score = '+d.value.toFixed(2);
        }
      })
      .histogram('MOA', MOA, {
        innerRadius: 1.65,
        outerRadius: 2.00,
        logScale: false,
        color: 'Blues',
        min: -1,
        max: maxMOA,
        tooltipContent: function (d) {
          return d.block_id+' | Resistant vs. Residual LNCaP<br>DeMAND p = '+Math.pow(10, -d.value).toExponential(2);
        }
      })
      .text('geneSymbol', geneSymbol, {
        innerRadius: 1.02,
        outerRadius: 1.35,
        style: {
            'font-size': 10,
            fill: 'black',
            opacity: 1,
            'font-weight': 400
        },
      })
      .render()
}

d3.queue()
  .defer(d3.json, './data/genes.json')
  .defer(d3.csv, './data/combined_results.txt')
  .defer(d3.csv, './data/preppi_predictions.txt')
  .await(drawCircos)
