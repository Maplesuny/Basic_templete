    <template>
    <div class="echarts-box">
        <div id="myEchats" :style="{ width: '1600px', height: 44 * 19 + 'px' }"></div>
        <div id="timeline-container" style="position: absolute;top: 130px;left: 180px;z-index: -1;"></div>
    </div>
    <div id="pagination_class">
        <q-btn @click="pre_page" v-bind:disabled="page <= 1">上一頁</q-btn>
        <p>{{ page }} / {{ maxPages }}</p>
        <q-btn @click="next(data_len)" v-bind:disabled="page >= maxPages">下一頁</q-btn>
    </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import axios from 'axios'
import drawTimeLine from '../action/Time-line'
export default {
    setup () {
        const start_time = ref(0)
        const end_time = ref(20)
        const montage_type = ref(0)
        const channel_array = ref([])
        const axisLabel_show = ref(false)
        const default_color = ref("#3a3c42");
        const data_len = ref(0)

        const myChart = ref(null)



        let page = ref(1)
        let minPage = 0
        let maxPages = end_time.value / 10

        // 取出channel前面數字儲存
        let channel_number_arr = [];
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

        // 更改
        function seeOO (dataLength) {
            console.log('seeOO')
            let option = myChart.value.getOption()
            // console.log(option)
            for (let i = 0; i < dataLength; i++) {
                option.xAxis[i].min = 10
                option.xAxis[i].max = 20
            }
            option && myChart.value.setOption(option);
            console.log('seeget', myChart.value.getOption());
        }

        function refresh () {
            let option2 = myChart.value.getOption()
            option2 && myChart.value.setOption(option2);
            console.log('Refresh')
        }

        // 上一頁
        function pre_page () {
            watch(page, () => {
                console.log('現在', page.value)
            })

            page.value = page.value - 1
        }
        // 下一頁
        function next (dataLength) {
            page.value = page.value + 1
            console.log('seeOO')
            let option = myChart.value.getOption()
            // console.log(option)
            for (let i = 0; i < dataLength; i++) {
                option.xAxis[i].min = 10
                option.xAxis[i].max = 20
            }
            option && myChart.value.setOption(option);
            console.log('seeget', myChart.value.getOption());
        }

        function SetOption (Dom, chart, start, end) {
            Dom = document.getElementById("myEchats");
            chart = echarts.init(Dom);
            const title = [];
            const xAxis = [];
            const yAxis = [];
            const grid = [];
            const series = [];
            axios.get(json_url).then((res) => {
                const data = res.data
                data_len.value = data.length

                // 取得channel name
                channel_name_function(data, data_len.value)
                // Count Channel number
                let count_channel = [];
                for (let i = 0; i < Object.keys(data).length; i++) {
                    count_channel.push(i);
                }
                channel_array.value.forEach(function (eeg_parameter, idx) {
                    convert_sec(512 * end_time.value, data, idx)
                    let arr_split = channel_array.value[idx].split("");

                    for (let l = 0; l < 3; l++) {
                        let conver_number = Number(arr_split[l]);
                        if (!isNaN(conver_number)) {
                            channel_number_arr.push(conver_number);
                            if (conver_number % 2 === 0) {
                                default_color.value = "#1607ed";
                            } else if (conver_number % 2 != 0) {
                                default_color.value = "#ed070f";
                            } else {
                                default_color.value = "#0d0c0c";
                            }
                        }
                    }

                    if (data[idx]["id"] === "ECG") {
                        default_color.value = "#0d0000";
                        axisLabel_show.value = !axisLabel_show.value
                    }

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
                        splitLine: {
                            // 坐標軸分隔線
                            show: true,
                            lineStyle: {
                                color: ['#626366'],
                                width: 0.5,
                                type: 'solid',
                                join: 'miter'
                            }

                        },
                        axisLabel: {
                            show: axisLabel_show.value,
                        },
                        // minorSplitLine: {
                        //     show: true
                        // },
                        // minorTick: {
                        //     // 顯示刻度線
                        //     show: true,
                        //     splitNumber: 1,
                        //     length: 15
                        // },
                        // axisLabel: {
                        //     // 要用show.value
                        //     show: true,
                        //     // interval: 10,
                        // },
                        gridIndex: idx,
                        min: start,
                        max: end,
                        interval: 1,
                    })
                    yAxis.push({
                        show: false,
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
                        // interval: 100000,
                        // max: 200,
                        // min: -200,

                    })
                    grid.push({
                        height: "30px",
                        top: (idx * 360) / 8.2 + 35 + "px",
                        // top: (idx * 120) + 55 + 'px',
                        left: "6.5%",
                        right: "5%",
                        containLabel: false
                    });
                    series.push({
                        type: 'line',
                        data: save_arr[idx],
                        symbol: 'none',
                        smoth: true,
                        color: default_color.value,
                        xAxisIndex: idx,
                        yAxisIndex: idx,
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
                            zoomOnMouseWheel: 'ctrl'
                        },
                        {
                            type: 'slider',
                            show: true,
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
                            saveAsImage: {},
                            mytools: {
                                show: true,
                                title: "Clear",
                                icon: "M12,0A12,12 0 0,1 24,12A12,12 0 0,1 12,24A12,12 0 0,1 0,12A12,12 0 0,1 12,0M12,2A10,10 0 0,0 2,12C2,14.4 2.85,16.6 4.26,18.33L18.33,4.26C16.6,2.85 14.4,2 12,2M12,22A10,10 0 0,0 22,12C22,9.6 21.15,7.4 19.74,5.67L5.67,19.74C7.4,21.15 9.6,22 12,22Z",
                                onclick: function () {
                                    myChart.value.dispatchAction({
                                        type: "restore",
                                    });


                                    // // 清除頁籤
                                    // page.value = 1
                                    // console.log('Restore')
                                    // setTimeout(refresh, 50);
                                },
                            },
                            mytools0: {
                                show: true,
                                title: "dataZoom",
                                icon: "M12,0A12,12 0 0,1 24,12A12,12 0 0,1 12,24A12,12 0 0,1 0,12A12,12 0 0,1 12,0M12,2A10,10 0 0,0 2,12C2,14.4 2.85,16.6 4.26,18.33L18.33,4.26C16.6,2.85 14.4,2 12,2M12,22A10,10 0 0,0 22,12C22,9.6 21.15,7.4 19.74,5.67L5.67,19.74C7.4,21.15 9.6,22 12,22Z",
                                onclick: function () {
                                    myChart.value.dispatchAction({
                                        type: "takeGlobalCursor",
                                        key: 'dataZoomSelect',
                                        dataZoomSelectActive: true
                                    });

                                    myChart.value.dispatchAction({
                                        type: 'dataZoom',
                                        dataZoomIndex: 0,
                                        start: 0,
                                        end: 100,
                                    })

                                    // // 清除頁籤
                                    // page.value = 1
                                    // console.log('Restore')
                                    setTimeout(refresh, 50);
                                },
                            },
                            mytools1: {
                                show: true,
                                title: "hihi2",
                                icon: "M12,0A12,12 0 0,1 24,12A12,12 0 0,1 12,24A12,12 0 0,1 0,12A12,12 0 0,1 12,0M12,2A10,10 0 0,0 2,12C2,14.4 2.85,16.6 4.26,18.33L18.33,4.26C16.6,2.85 14.4,2 12,2M12,22A10,10 0 0,0 22,12C22,9.6 21.15,7.4 19.74,5.67L5.67,19.74C7.4,21.15 9.6,22 12,22Z",
                                onclick: function () {
                                    myChart.value.dispatchAction({
                                        type: "takeGlobalCursor",
                                        key: 'brush',
                                        brushOption: {
                                            brushType: 'rect'
                                        }
                                    });

                                    console.log('clear')
                                },
                            },
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

                option && chart.setOption(option);

                // let seeoption = myChart.getOption()
                // console.log('seeee', seeoption)
                // let option_xAxis_min = option.xAxis[0].min
                // let option_xAxis_max = option.xAxis[0].max
                // seeOO(myChart)


                watch(page, () => {
                    console.log('page is :', page.value)
                })




                // drawTimeLine("#timeline-container", end_time.value / 10, data.length, rangeArray);
            }).catch((err) => {
                alert('false')
                console.log('Error message :', err)
            })
        }



        onMounted(() => {
            const chartDom = document.getElementById("myEchats");
            myChart.value = echarts.init(chartDom);

            SetOption(chartDom, myChart.value, start_time.value, end_time.value)

        })

        return {
            myChart, data_len,
            page, minPage, maxPages,
            next, pre_page, seeOO
        }
    },
}
</script>
<style scoped>
#pagination_class {
    display: flex;
    top: 20px;
    justify-content: center;
    justify-content: space-evenly;
}
</style>