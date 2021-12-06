    <template>
    <div class="q-pa-md">
        <div class="echarts-box">
            <q-page-container>
                <div id="myEchatts" :style="{ width: '1600px', height: 44 * 50 + 'px' }"></div>
                <div id="type">dsfsdfd</div>
            </q-page-container>
        </div>
    </div>
</template>


<script>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
// import * as echarts from 'echarts/lib/echarts';
import axios from 'axios'
// import json from '../assets/Fp1_A1_0_20s.json'
export default {
    setup () {
        const start_time = ref(0)
        const end_time = ref(20)
        const montage_type = ref(0)
        const channel_array = ref([])
        const myChart = ref(null)
        let color = ref("#3a3c42");
        // 取出channel前面數字儲存
        let channel_number_arr = [];
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
                // const data = json
                const data_len = data.length
                channel_name_function(res.data, data_len)
                console.log('channel名稱列表', channel_array.value)


                // Count Channel number
                let count_channel = [];
                for (let i = 0; i < Object.keys(data).length; i++) {
                    count_channel.push(i);
                }

                // 第一筆資料長度
                const first_data_length = data[0]['value'].length
                const lsat_channel_index = first_data_length - 1

                channel_array.value.forEach(function (egg_parameter, idx) {
                    let arr_split = channel_array.value[idx].split("");
                    for (let l = 0; l < 3; l++) {
                        let conver_number = Number(arr_split[l]);
                        if (!isNaN(conver_number)) {
                            channel_number_arr.push(conver_number);
                            if (conver_number % 2 === 0) {
                                color.value = "#1607ed";
                            } else if (conver_number % 2 != 0) {
                                color.value = "#ed070f";
                            } else {
                                color.value = "#0d0c0c";
                            }
                        }
                    }

                    const show = ref(false)
                    const label_show = ref(false)
                    if (data[idx]["id"] === "ECG") {
                        color.value = "#0d0000";
                        show.value = true
                        label_show.value = true
                    }

                    convert_sec(512 * end_time.value, data, idx)
                    title.push({
                        id: idx,
                        textBaseline: 'middle',
                        top: (idx * 360) / 8.2 + 50 + "px",
                        left: '1%',
                        text: egg_parameter,
                        bottom: "20"
                    });
                    xAxis.push({
                        type: 'value',
                        show: true,
                        minorSplitLine: {
                            show: show.value
                        },
                        minorTick: {
                            // 顯示刻度線
                            show: true,
                            splitNumber: 1,
                            length: 15
                        },
                        // axisTick: {
                        //     show: true,
                        //     interval: 1,
                        // },
                        axisLabel: {
                            show: label_show.value,
                            // interval: 0,
                        },
                        gridIndex: idx,

                        min: start,
                        max: end,
                        interval: 1,
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
                        // 網格線
                        splitLine: {
                            show: false
                        },
                        interval: 100000
                    })

                    grid.push({
                        height: "30px",
                        top: (idx * 360) / 8.2 + 35 + "px",
                        // top: (idx * 120) + 55 + 'px',
                        left: "13%",
                        right: "5%",
                        containLabel: false

                    });

                    series.push({
                        type: 'line',
                        data: save_arr[idx],
                        symbol: 'none',
                        color: color.value,
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

                option && myChart.value.setOption(option);


            }).catch((err) => {
                alert('請求失敗')
                console.log('請求失敗', err)
            })
        }

        // setTimeout(refreash_page, 1000);

        onMounted(() => {
            // SetOption(start_time.value, end_time.value)
            SetOption(0, 10)
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