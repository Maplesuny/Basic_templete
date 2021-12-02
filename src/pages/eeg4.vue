    <template>
    <div class="echarts-box">
        <div id="myEchats" :style="{ width: '1600px', height: 44 * 60 + 'px' }"></div>
    </div>
</template>


<script>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import axios from 'axios'
export default {
    setup () {
        const start_time = ref(0)
        const end_time = ref(20)
        const montage_type = ref(0)
        const channel_array = ref([])
        // const json_url = 'http://127.0.0.1:80/api/v1/eegData?start_time=' + start_time.value + '&end_time=' + end_time.value + '&montage_type=' + montage_type.value
        let json_url = 'http://10.65.51.240:28081/api/v1/eegData?start_time=' + start_time.value + '&end_time=' + end_time.value + '&montage_type=' + montage_type.value

        // 取得channel 名稱
        function channel_name_function (data, arr_length) {
            for (let i = 0; i < arr_length; i++) {
                channel_array.value.push(data[i]['id'])
            }
        }

        // 將資料合併到save arr中
        let save_arr = []
        function convert_sec (number, data, idx) {
            const base = end_time.value / number
            const list_array = []
            let sum = 0
            for (let i = 0; i < number; i++) {
                sum = sum + base
                // count_arr.value.push([sum, data[16]['value'][i]])
                list_array.push([sum, data[idx]['value'][i]])
            }

            save_arr.push(list_array)
            return save_arr
        }

        function SetOption (start, end) {
            const chartDom = document.getElementById("myEchats");
            const myChart = echarts.init(chartDom);

            const title = [];
            const xAxis = [];
            const yAxis = [];
            const grid = [];
            const series = [];

            axios.get(json_url).then((res) => {
                const data = res.data
                const data_len = data.length
                // 取得channel name
                channel_name_function(data, data_len)

                // Count Channel number
                let count_channel = [];
                for (let i = 0; i < Object.keys(data).length; i++) {
                    count_channel.push(i);
                }

                channel_array.value.forEach(function (eeg_parameter, idx) {
                    convert_sec(512 * end_time.value, data, idx)
                    title.push({
                        id: idx,
                        textBaseline: 'middle',
                        top: (idx * 360) / 8.2 + 50 + "px",
                        left: '1%',
                        text: eeg_parameter,
                        bottom: "20"
                    });

                    xAxis.push({
                        type: 'value',
                        show: true,
                        minorSplitLine: {
                            show: true
                        },
                        minorTick: {
                            // 顯示刻度線
                            // show: true,
                            splitNumber: 1,
                            // length: 0
                        },
                        axisLabel: {
                            // 要用show.value
                            show: true,
                            // interval: 10,
                        },
                        gridIndex: idx,

                        min: start,
                        max: end,
                        interval: 1,
                    })

                    yAxis.push({
                        show: true,
                        type: 'value',
                        scale: true,
                        axisLabel: {
                            show: true,
                            showMinLabel: true,
                            showMaxLabel: true,
                            // fromatter: function (value) {
                            //     return value;
                            // }
                        },
                        gridIndex: idx,
                        // 網格線
                        splitLine: {
                            show: false
                        },
                        // interval、min、max 要一起搭配
                        interval: 100000,
                        min: -100,
                        max: 100,

                    })

                    grid.push({
                        height: "60px",
                        top: (idx * 760) / 8.2 + 35 + "px",
                        // top: (idx * 120) + 55 + 'px',
                        left: "13%",
                        right: "5%",
                        containLabel: false

                    });

                    series.push({
                        type: 'line',
                        data: save_arr[idx],
                        symbol: 'none',
                        smoth: true,
                        xAxisIndex: idx,
                        yAxisIndex: idx
                    })
                })

                let option = {
                    animation: false,
                    title: title,
                    xAxis: xAxis,
                    yAxis: yAxis,
                    grid: grid,
                    series: series,
                    dataZoom: [
                        {
                            type: 'inside',
                            xAxisIndex: count_channel,
                        }
                    ],
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'cross'
                        }
                    },
                    toolbox: {
                        right: 10,
                        feature: {
                            dataZoom: {
                                yAxisIndex: 'none'
                            },
                            restore: {},
                            saveAsImage: {}
                        }
                    },
                    brush: {
                        id: 'brush',
                        geoIndex: 'all',
                        seriesIndex: 'all',
                        brushLink: 'all',
                        toolbox: ['rect', 'keep', 'lineX', 'clear'],
                        inBrush: {
                            opacity: 1,
                            symbolSize: 20,
                        },
                        // 調整是否可平移
                        transformable: false,
                        throttleType: 'debounce',
                        throttleDelay: 600,
                        //   brushMode: 'multiple',
                        brushStyle: {
                            borderWidth: 3,
                            color: 'rgba(245,39,56,0)',
                            borderColor: 'rgba(220,20,57,0.8)',
                        },
                    },
                }
                option && myChart.setOption(option);

            }).catch((err) => {
                alert('false')
                console.log('Error message :', err)
            })
        }

        onMounted(() => {
            SetOption(start_time.value, end_time.value)
        })

        return {

        }

    },
}
</script>