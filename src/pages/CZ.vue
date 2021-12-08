<template>
    <!-- <div class="q-pa-md">
        <q-btn color="purple" @click="showLoading" label="Show Loading" />
    </div>-->
    <div class="echarts-box">
        <div id="myEchats" :style="{ width: '1800px', height: 44 * 19 + 'px' }"></div>
        <id id="testtext" :style="{ width: '600px', height: 40 * 10 + 'px' }">
            <Todo :inputText="ss_ing"></Todo>
        </id>
    </div>
    <div id="pagination_class">
        <q-btn v-bind:disabled="page <= Minpage" @click="pre_button">上一頁</q-btn>
        <p>{{ page }} / {{ Maxpage }}</p>
        <q-btn v-bind:disabled="page >= Maxpage" @click="next_button">下一頁</q-btn>
    </div>
</template>

<script>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import axios from 'axios'
import { useQuasar } from 'quasar'
import { sharpSignalCellularAlt } from '@quasar/extras/material-icons-sharp'
import todo from '../pages/TODO.vue'

export default {
    components: {
        Todo: todo,
    },
    setup () {
        const $q = useQuasar()
        let timer

        const ss_ing = ref("")

        let range_start;
        let range_end;
        let select_start = ref(0);
        let select_end = ref(0);

        const start_time = ref(0)
        const end_time = ref(70)
        var default_startTime = ref(0)
        var default_endTime = ref(10)
        const montage_type = ref(1)
        const channel_array = ref([])
        const axisLabel_show = ref(false)
        const default_color = ref("#3a3c42");
        const data_len = ref(0)
        // important           // const myChart = ref() 用這個會有錯誤
        var myChart

        // 取出channel前面數字儲存
        let channel_number_arr = [];

        const page = ref(1)
        const Minpage = ref(1)
        const Maxpage = ref(end_time.value / 10)

        watch(page, () => {
            console.log('當前page : ', page.value)
            // Update_Option(page.value)
        })



        // const json_url = 'https://cdn.jsdelivr.net/gh/apache/echarts-website@asf-site/examples/data/asset/data/aqi-beijing.json'
        const json_url = 'http://10.65.51.240:28081/api/v1/eegData?start_time=' + start_time.value + '&end_time=' + end_time.value + '&montage_type=' + montage_type.value


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

        //上一頁
        function pre_button () {
            page.value--
            Update_Option(page.value)
            Clear_select()
        }

        // 下一頁
        function next_button () {
            // 當前頁數增加
            page.value++
            Update_Option(page.value)
            Clear_select()

        }

        // update 頁數 & Option
        function Update_Option (page) {
            console.log('update_option')
            var start = (page - 1) * 10
            var end = page * 10

            console.log('start_end', start, end)
            // Compare === 'next' ? (start = start_time.value + 10) : (start = start_time.value - 10)
            const xAxis = [];
            const yAxis = [];
            const change_axisLabel_show = ref(false)
            channel_array.value.forEach(function (eeg_parameter, idx) {
                if (eeg_parameter === "ECG") {
                    default_color.value = "#0d0000";
                    change_axisLabel_show.value = !change_axisLabel_show.value
                }
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
                        show: change_axisLabel_show.value,
                    },
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
            })
            let option = {
                xAxis: xAxis,
                yAxis: yAxis
            }

            myChart.setOption(option)
        }


        function All_data_Option (start, end) {
            const xAxis = [];
            const yAxis = [];
            const change_axisLabel_show = ref(false)
            channel_array.value.forEach(function (eeg_parameter, idx) {
                if (eeg_parameter === "ECG") {
                    default_color.value = "#0d0000";
                    change_axisLabel_show.value = !change_axisLabel_show.value
                }
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
                        show: change_axisLabel_show.value,
                    },
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
            })
            let option = {
                xAxis: xAxis,
                yAxis: yAxis
            }

            myChart.setOption(option)
        }

        // [Echarts] Clear Select 
        function Clear_select () {
            myChart.dispatchAction({
                type: "brush",
                command: 'clear',
                areas: []
            });
        }

        function create_select () {
            myChart.dispatchAction({
                type: 'brush',
                areas: [
                    {
                        burshType: 'rect',
                        xAxisIndex: 0,
                        coordRange: [1378, 1518]
                    }
                ]
            })
        }



        //Setting the  ECHART option 
        function setOption (start, end) {
            const chartDom = document.getElementById('myEchats');
            myChart = echarts.init(chartDom);
            axios.get(json_url).then((res) => {
                const title = [];
                const xAxis = [];
                const yAxis = [];
                const grid = [];
                const series = [];

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
                        id: idx,
                        height: "30px",
                        top: (idx * 360) / 8.2 + 35 + "px",
                        left: "6.5%",
                        right: "5%",
                        containLabel: false
                    });
                    series.push({
                        id: idx,
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
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'cross'
                        }
                    },
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
                                title: "All Graph",
                                icon: sharpSignalCellularAlt,
                                onclick: function () {
                                    // myChart.dispatchAction({

                                    //     type: "restore",
                                    // });
                                    All_data_Option(start_time.value, end_time.value)
                                },
                            },
                            mytools1: {
                                show: true,
                                title: "Restore",
                                icon: 'M178,101 q23,25 46,0 q6,-31 -22,-38 q-30,1 -27,26 l-12,-13 l30,0 l-17,14',
                                // icon: sharpSignalCellularAlt,
                                onclick: function () {
                                    myChart.dispatchAction({
                                        type: "restore",
                                    });
                                    page.value = Minpage.value
                                },
                            },
                            mytools2: {
                                show: true,
                                title: "claer",
                                icon: 'M 0 0 M 0 -1 L 2 1 M 2 0 M 0 -1 L 0 1 M 1 1 L 2 1 L 0 1 L 0 1 M 0 1 L 2 -1 M 2 1 L 2 1 M 2 1 L 2 1 L 2 0 L 2 -1 M 2 -1 L 2 -1 M 2 -1 L 2 -1 M 2 -1 L 1 -1 M 1 -1 L 0 -1',
                                // icon: sharpSignalCellularAlt,
                                onclick: function () {
                                    myChart.dispatchAction({
                                        type: "brush",
                                        command: 'clear',
                                        areas: []
                                    });
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


                function select_brushType (params, whichLinx) {
                    let brushComponent = params.batch[0];
                    console.log(brushComponent);

                    // 判斷X軸是LineX 還是 rect
                    if (whichLinx !== "lineX") {
                        range_start = brushComponent.areas[0].range[0][0];
                        range_end = brushComponent.areas[0].range[0][1];
                    } else {
                        range_start = brushComponent.areas[0].range[0];
                        range_end = brushComponent.areas[0].range[1];
                    }
                    let bb_start = brushComponent.areas[0].range[1][0];
                    let bb_end = brushComponent.areas[0].range[1][1];
                    console.log("range_start", range_start);
                    console.log("range_end", range_end);

                    console.log('bb_start/end : ', bb_start, bb_end)

                    // 再將rnage座標轉作為xy的座標(coordRange的值)
                    let coordRange_start = myChart.convertFromPixel({ seriesIndex: 0 }, [range_start, range_end])[0];

                    let corrdRange_end = myChart.convertFromPixel({ seriesIndex: 0 }, [range_end, range_start])[0];

                    console.log("coordRange_start", coordRange_start);
                    console.log("corrdRange_end", corrdRange_end);

                    ss_ing.value =
                        "Rect Range of :" +
                        coordRange_start +
                        " second 到 " +
                        corrdRange_end +
                        " second";
                    console.log("ss_ing", ss_ing.value);

                    let aa = option.title[0];
                    console.log(aa);
                }


                myChart.on('brushSelected', function (params) {
                    let brushComponent = params.batch[0]
                    console.log('brushComponent', brushComponent)

                    if (brushComponent.areas[0] !== undefined) {

                        let type = brushComponent.areas[0].brushType;
                        select_brushType(params, type);

                    }
                })



                option && myChart.setOption(option);

            }).catch((err) => {
                alert('error', err)
                console.log('err :', err)
            })
        }


        //Loading
        function showLoading () {
            $q.loading.show({
                message: 'Doing something. Please wait...',
                boxClass: 'bg-grey-2 text-grey-9',
                spinnerColor: 'primary'
            })

            // hiding in 3s
            timer = setTimeout(() => {
                $q.loading.hide()
                timer = void 0
            }, end_time.value * 30)
        }

        // Run Loading
        showLoading()

        onBeforeUnmount(() => {

            if (timer !== void 0) {
                clearTimeout(timer)
                $q.loading.hide()
            }
        })

        onMounted(() => {
            // let default_startTime = 0
            // let default_endTime = 10
            setOption(default_startTime.value, default_endTime.value)
        })


        return {
            page, Minpage, Maxpage,
            pre_button, next_button,
            showLoading,
            ss_ing
        }


    },
}
</script>

<style scoped>
.echarts-box {
    display: flex;
}
.testtext {
    top: 20px;
}
#pagination_class {
    display: flex;
    /* margin-left: 700px; */
    margin-top: 50px;

    justify-content: left;
    justify-content: space-evenly;
    /* justify-content: center; */
}
</style>