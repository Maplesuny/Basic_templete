    <template>
    <div class="q-pa-md">
        <div class="echarts-box">
            <div id="myEchatts" :style="{ width: '1600px', height: 44 * 50 + 'px' }"></div>
            <div id="type">dsfsdfd</div>
        </div>
    </div>
</template>


<script>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
// import * as echarts from 'echarts/lib/echarts';
import axios from 'axios'
export default {
    setup () {
        const start_time = ref(0)
        const end_time = ref(10)
        const montage_type = ref(0)
        const channel_array = ref([])
        const myChart = ref(null)
        const merge_arr = ref([])
        const count_arr = ref([]) // 放資料轉時間的array
        // const json_url = 'http://127.0.0.1:80/api/v1/eegData?start_time=' + start_time.value + '&end_time=' + end_time.value + '&montage_type=' + montage_type.value
        let json_url = 'http://10.65.51.240:28081/api/v1/eegData?start_time=' + start_time.value + '&end_time=' + end_time.value + '&montage_type=' + montage_type.value

        // // 取得目前寬度，每次刷新比例會適中
        let get_width = document.documentElement.clientWidth
        let fixed_ = ref("")
        fixed_.value = (get_width - 150) + 'px'

        function channel_name_function (data, arr_length) {
            for (let i = 0; i < arr_length; i++) {
                channel_array.value.push(data[i]['id'])
            }
        }

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

        function refreash_page () {
            // 讓頁面重新渲染
            const option2 = myChart.value.getOption()
            option2 && myChart.value.setOption(option2);
        }

        function SetOption (start, end) {
            const chartDom = document.getElementById("myEchatts")
            myChart.value = echarts.init(chartDom)

            const title = []
            const xAxis = []
            const yAxis = []
            const grid = []
            const series = []

            axios.get(json_url).then((res) => {
                //請求成功
                const data = res.data
                const data_len = data.length

                channel_name_function(res.data, data_len)
                console.log('channel名稱列表', channel_array.value)

                // 第一筆資料長度
                const first_data_length = data[0]['value'].length
                const lsat_channel_index = first_data_length - 1
                // 轉換成我們需要的array
                // convert_sec(512 * end_time.value, data)
                // console.log('轉換成我們需要的array', count_arr.value)

                // let test_channel = ['test1', 'test2', 'test3', 'test4']



                // test_channel.forEach(function (eeg_parameter, idx) {
                //     convert_sec(512 * end_time.value, data, idx)
                //     console.log(eeg_parameter, idx)
                //     console.log('save_arr', save_arr)
                // })

                // console.log('dfdsf', save_arr[0])


                channel_array.value.forEach(function (egg_parameter, idx) {
                    convert_sec(512 * end_time.value, data, idx)
                    console.log(save_arr)
                    title.push({
                        id: idx,
                        textBaseline: 'middle',
                        top: (105 * idx) + 80 + 'px',
                        left: '1%',
                        text: egg_parameter,
                    });
                    xAxis.push({
                        type: 'value',
                        minorSplitLine: {
                            show: true
                        },
                        minorTick: {
                            // 顯示刻度線
                            show: true,
                            splitNumber: 2,
                            length: 12
                        },
                        axisLabel: {
                            show: true,
                            interval: 1,
                        },
                        gridIndex: idx,
                        min: start,
                        max: end
                    });

                    yAxis.push({
                        show: true,
                        type: 'value',
                        scale: true,
                        axisLabel: {
                            show: true,
                            showMinLabel: true,
                            showMaxLabel: true,
                            fromatter: function (value) {
                                return value;
                            }
                        },
                        gridIndex: idx,
                    })

                    grid.push({
                        height: (1 * idx) + 60 + 'px',
                        top: (105 * idx) + 55 + 'px'
                        // top: '55px'
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

                ///////////
                // convert_sec(512 * end_time.value, data, count_arr.value, 0)
                // let option = {
                //     animation: false,
                //     title: {
                //         text: data[0]['id'],
                //         textBaseline: "middle",
                //         left: '1%',
                //         top: '25x'
                //     },
                //     grid: {
                //         height: '60px',
                //     },
                //     xAxis: {
                //         type: 'value',
                //         minorSplitLine: {
                //             show: true
                //         },
                //         minorTick: {
                //             // 顯示刻度線
                //             show: true,
                //             splitNumber: 2,
                //             length: 8
                //         },
                //         axisLabel: {
                //             show: true,
                //             interval: 1,
                //         },
                //         min: start,
                //         max: end
                //     },
                //     yAxis: {
                //         show: true,
                //         type: 'value',
                //         scale: true,
                //         axisLabel: {
                //             show: true,
                //             showMinLabel: true,
                //             showMaxLabel: true,
                //             fromatter: function (value) {
                //                 return value;
                //             }
                //         }
                //     },
                //     tooltip: {
                //         trigger: 'axis',
                //         axisPointer: {
                //             type: 'cross'
                //         }
                //     },

                //     series: {
                //         type: 'line',
                //         data: count_arr.value,
                //         symbol: 'none',
                //         smoth: true,
                //         xAxisIndex: 0
                //     },
                //     dataZoom: [
                //         {
                //             id: 'dataZoomX',
                //             type: 'slider',
                //             xAxisIndex: [0],
                //             filterMode: 'empty'
                //         }
                //     ],
                //     toolbox: {
                //         right: 10,
                //         feature: {
                //             dataZoom: {
                //                 yAxisIndex: 'none'
                //             },
                //             restore: {},
                //             saveAsImage: {}
                //         }
                //     },
                //     brush: {
                //         id: 'brush',
                //         geoIndex: 'all',
                //         seriesIndex: 'all',
                //         brushLink: 'all',
                //         toolbox: ['rect', 'keep', 'lineX', 'clear'],
                //         inBrush: {
                //             opacity: 1,
                //             symbolSize: 20,
                //         },
                //         // 調整是否可平移
                //         transformable: false,
                //         throttleType: 'debounce',
                //         throttleDelay: 600,
                //         //   brushMode: 'multiple',
                //         brushStyle: {
                //             borderWidth: 3,
                //             color: 'rgba(245,39,56,0)',
                //             borderColor: 'rgba(220,20,57,0.8)',
                //         },
                //     },


                // }

                option && myChart.value.setOption(option);


            }).catch((err) => {
                alert('請求失敗')
                console.log('請求失敗', err)
            })
        }

        setTimeout(refreash_page, 500);

        onMounted(() => {
            SetOption(start_time.value, end_time.value)
        })


        return {
            channel_array,
            styleobject: {
                width: fixed_.value,
                height: '300px'
            }
        }
    },
}
</script>
<style scoped>
.echarts-box {
    display: flex;
}
</style>