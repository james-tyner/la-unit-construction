<script>
import { Line } from "vue-chartjs";

export default {
    extends:Line,
    props:["chartData", "height", "width"],
    data(){
        let tempLabels = Object.keys(this.chartData);
        tempLabels.pop();

        let tempValues = Object.values(this.chartData);
        tempValues.pop();

        // uncomment if you decide cumulative is better than year-by-year
        // const cumulativeSum = (sum => value => sum += value)(0);
        // tempValues = tempValues.map(cumulativeSum)

        let filledData = {
            labels:tempLabels,
            datasets:[{
                label:"Units approved",
                data:tempValues,
                backgroundColor:"white",
                borderColor:"white",
                showLine:true,
                lineTension:0,
                pointBorderColor:"#00adff",
                pointBorderWidth:2,
                pointRadius:4
            }]
        }
    
        return {
            filledData,
            options:{
                responsive:true,
                maintainAspectRatio:false,
                scales:{
                    yAxes:[{
                        display:false,
                        ticks:{
                            beginAtZero:true
                        }
                    }],
                    xAxes:[{
                        color:"white",
                        gridLines:{
                            display:false
                        },
                        ticks:{
                            fontColor:"white",
                            fontFamily:"'Inter var', 'Inter', 'sans-serif"
                        }
                    }]
                },
                legend:{
                    display:false
                },
                tooltip:{
                    titleFontFamily:"'Inter var', 'Inter', 'sans-serif"
                }
            }
        }
    },
    mounted(){
        this.renderChart(this.filledData, this.options)
    }
}
</script>