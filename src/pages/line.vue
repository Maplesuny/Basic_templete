    <template>
    <div class="q-pa-md">
        <div class="echarts-box">
            <div id="myEchatts" :style="styleobject"></div>
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
        const json_url = 'http://127.0.0.1:80/api/v1/eegData?start_time=' + start_time.value + '&end_time=' + end_time.value + '&montage_type=' + montage_type.value





        // // 取得目前寬度，每次刷新比例會適中
        let get_width = document.documentElement.clientWidth
        let fixed_ = ref("")
        fixed_.value = (get_width - 150) + 'px'

        function channel_name_function (data, arr_length) {
            for (let i = 0; i < arr_length; i++) {
                channel_array.value.push(data[i]['id'])
            }
        }

        function convert_sec (number, data) {
            const base = end_time.value / number
            let sum = 0
            for (let i = 0; i < number; i++) {
                sum = sum + base
                count_arr.value.push([sum, data[0]['value'][i]])
            }
            return count_arr
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
                // 轉換成我們需要的array
                convert_sec(512 * end_time.value, data)
                console.log('轉換成我們需要的array', count_arr)

                let option = {
                    animation: false,
                    title: {
                        text: data[0]['id'],
                        textBaseline: "middle",
                        left: '1%',
                        top: '25x'
                    },
                    grid: {
                        height: '60px',
                    },
                    xAxis: {
                        type: 'value',
                        minorSplitLine: {
                            show: true
                        },
                        minorTick: {
                            // 顯示刻度線
                            show: true,
                            splitNumber: 2,
                            length: 8
                        },
                        axisLabel: {
                            show: true,
                            interval: 1,
                        },
                        min: start,
                        max: end
                    },
                    yAxis: {
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
                        }
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'cross'
                        }
                    },
                    series: {
                        type: 'line',
                        data: count_arr.value,
                        symbol: 'none',
                        smoth: true,
                        xAxisIndex: 0
                    },
                    dataZoom: [
                        {
                            id: 'dataZoomX',
                            type: 'slider',
                            xAxisIndex: [0],
                            filterMode: 'empty'
                        }
                    ],
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