<template>
    <div class="echarts-box">
        <div id="timeline-container" style="position: absolute;top: 920px;left: 70px"></div>
        <div class="charts">
            <div id="myEcharts"></div>
            <id id="testtext" :style="{ width: '600px', height: 40 * 10 + 'px' }">
                <Todo :inputText="sec_range"></Todo>
            </id>
        </div>
        <canvas id="canvas" style="position: absolute;top: 128px;left: 80px;z-index: -1;"></canvas>
        <canvas id="canvas2" style="position: absolute;top: 80px;left: 10px;z-index: -1;"></canvas>
        <div class="q-pb-lg flex flex-center fit row fit">
            <q-btn @click="pre_button" v-bind:disabled="page <= Minpage">上一頁</q-btn>
            <span>第 {{ page }} 頁 / 共 {{ Maxpage }}頁</span>
            <q-btn @click="next_button" v-bind:disabled="page >= Maxpage">下一頁</q-btn>
            <span>跳至</span>
            <q-input
                outlined
                v-model="jump_to"
                class="pagination-input"
                placeholder="請輸入頁數"
                mask="##"
            ></q-input>
            <span>頁</span>
            <q-btn @click="send_page" v-if="jump_to <= Maxpage">送出</q-btn>
            <q-btn @click="send_page" v-else disable>送出</q-btn>
        </div>
    </div>
</template>

<script>
import { ref, onMounted, watch, onBeforeUnmount, onBeforeMount, reactive } from "vue";
import * as echarts from "echarts";
import axios from "axios";
import { sharpSignalCellularAlt, sharpCollectionsBookmark } from '@quasar/extras/material-icons-sharp'
import option_function from '../Javascript/option_funtion';
import timeline from '../Javascript/Timeline'
import { useQuasar } from 'quasar'
import todo from '../pages/TODO.vue'
export default {
    components: {
        Todo: todo,
    },
    setup () {
        //----for Loding timer----
        const $q = useQuasar()
        let timer
        //-----------------------
        const start_time = ref(0);
        const end_time = ref(10);
        const default_statrt = ref(0)
        const default_end = ref(10)
        const montage_type = ref(0);
        const channel_array = ref([]);
        const data_len = ref(0);
        const default_color = ref("#3a3c42")
        let jump_to = ref(null)
        var api_data;
        var api_time
        var myChart; // 用 const myChart = ref() 其他地方不能使用myChart做事
        // get channel pre number
        const channel_number_arr = [];
        // 將資料合併到save arr中 (適用於xAxis type:value)
        let save_arr = [];
        const page = ref(1)
        const Minpage = ref(1)
        // const Maxpage = ref(end_time.value / 10)
        const Maxpage = ref(10)
        // 要傳出去的值
        const sec_range = ref("")
        // 抓browser的寬
        const screen_length = ref(0)
        const screen_height = ref(0)
        watch(page, () => {
            console.log('當前page : ', page.value)
            // Update_Option(page.value)
            if (page.value > page.value) {
                console.log('下一頁')
            }
        })
        watch(default_statrt, () => {
            console.log('Defaultstart_time:', default_statrt.value)
        })
        watch(default_end, () => {
            console.log('Defaultend_time:', default_end.value)
        })
        // watch(jump_to, () => {
        //     console.log('jump_to:', jump_to.value)
        // })
        const time_url = 'http://127.0.0.1:8000/api/v1/Time_Information'
        const json_url =
            "http://127.0.0.1:8000/api/v1/eegData?start_time=" +
            start_time.value +
            "&end_time=" +
            end_time.value +
            "&montage_type=" +
            montage_type.value;
        // load javascript
        const { connect_api, connect_api_time, channel_name_function, convert_sec, convert_sec2, roundToTwo } =
            option_function();
        // 上一頁
        function pre_button () {
            page.value--
            dynamic_10sdata('pre')
            // restroe()
        }
        // 下一頁
        async function next_button () {
            page.value++
            dynamic_10sdata('next')
            // restroe()
        }
        function send_page () {
            // console.log(jump_to.value)
            if (jump_to.value != 0) {
                page.value = Number(jump_to.value)
                // dynamic_10sdata('next')
                console.log(Number(jump_to.value))
                if (isNaN(Number(jump_to.value))) {
                    // 非數字
                    alert('Please check input, Input type is [Number]')
                } else if (Number(jump_to.value) > Maxpage.value) {
                    // 大於最大頁數
                    alert('Your page greater than ' + Maxpage.value + ' ,Please ctry again')
                } else if ((Number(jump_to.value) < 1)) {
                    alert('Page number is not found , Please try again')
                } else {
                    dynamic_10sdata()
                }
            } else {
                alert('Page number ' + "'" + jump_to.value + "'" + '  is not found , Please try again!')
            }
        }
        function restroe () {
            // 或許可以做清除之前先記憶框選了那些 
            myChart.dispatchAction({
                type: "restore",
            });
        }
        // convert_sec2(dd, 10, 20, 0, api_data)
        async function dynamic_10sdata () {
            console.log('page is', page.value)
            let dynamic_start = (page.value * 10) - 10
            let dynamic_end = page.value * 10
            console.log('dynamic_start/dynamic_end', dynamic_start, dynamic_end)
            // 圖表x軸會照著default_start來計算，需要賦予值
            default_statrt.value = dynamic_start
            default_end.value = dynamic_end
            console.log("default_statrt / default_end :", default_statrt.value, default_end.value)
            let url =
                "http://127.0.0.1:8000/api/v1/eegData?start_time=" +
                dynamic_start +
                "&end_time=" +
                dynamic_end +
                "&montage_type=" +
                montage_type.value;
            console.log(url)
            let series1 = []
            let Daa = await connect_api(url)
            let data_len = Daa.length
            // Count Channel number
            let count_channel = [];
            for (let i = 0; i < Object.keys(Daa).length; i++) {
                count_channel.push(i);
            }
            // 將資料合併到save_arr ，format : [time,value]  value只有10秒資料
            let all_save_arr = []
            for (let i = 0; i < data_len; i++) {
                convert_sec2(all_save_arr, default_statrt.value, default_end.value, i, Daa)
            }
            let next_page_value = ref(0)
            channel_array.value.forEach(function (egg_parameter, idx) {
                let de = data_len - 1 - idx
                // console.log('Daa', all_save_arr[de])
                let arr_split = channel_array.value[de].split("");
                for (let l = 0; l < 3; l++) {
                    let conver_number = Number(arr_split[l]);
                    if (!isNaN(conver_number)) {
                        channel_number_arr.push(conver_number);
                        if (conver_number % 2 === 0) {
                            default_color.value = "#1607ed";
                        } else if (conver_number % 2 != 0) {
                            default_color.value = "#ed070f";
                        }
                    }
                }
                if (idx === 0) {
                    default_color.value = "#0c0d0c";
                }
                if (arr_split[1] == 'z') {
                    default_color.value = "#0bb30b";
                }
                series1.push({
                    type: "line",
                    name: egg_parameter,
                    data: all_save_arr[de],
                    symbol: "none",
                    smoth: true,
                    color: default_color.value,
                });
            })
            let option = {
                animation: false,
                xAxis: {
                    type: "value",
                    show: true,
                    splitLine: {
                        // 坐標軸分隔線
                        show: true,
                        lineStyle: {
                            color: ["#626366"],
                            width: 0.5,
                            type: "solid",
                            join: "miter",
                        },
                    },
                    axisLabel: {
                        formatter: function (value) {
                            // 從start time抓開頭，從開頭+value
                            next_page_value.value = default_statrt.value
                            next_page_value.value = next_page_value.value + value
                            return next_page_value.value
                        },
                        show: true,
                    },
                    min: 0,
                    max: 10,
                    interval: 1,
                },
                yAxis: {
                    show: false,
                    type: "value",
                    scale: true,
                    axisLabel: {
                        show: true,
                        showMinLabel: true,
                        showMaxLabel: true,
                    },
                    // 網格線
                    splitLine: {
                        show: false,
                    },
                    min: 385 * (-1 * data_len),
                    max: 300,
                },
                series: series1,
                grid: {
                    left: "7%",
                    containLabel: false
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
                        saveAsImage: {},
                        mytools: {
                            show: true,
                            title: "Clear",
                            // icon: "M12,0A12,12 0 0,1 24,12A12,12 0 0,1 12,24A12,12 0 0,1 0,12A12,12 0 0,1 12,0M12,2A10,10 0 0,0 2,12C2,14.4 2.85,16.6 4.26,18.33L18.33,4.26C16.6,2.85 14.4,2 12,2M12,22A10,10 0 0,0 22,12C22,9.6 21.15,7.4 19.74,5.67L5.67,19.74C7.4,21.15 9.6,22 12,22Z",
                            icon: sharpSignalCellularAlt,
                            onclick: function () {
                                // myChart.dispatchAction({
                                //     type: "restore",
                                // });
                                // All_data_Option(start_time.value, end_time.value)
                            },
                        },
                        mytools2: {
                            show: true,
                            title: "aaaa",
                            // icon: 'M 0 0 M 0 -1 L 2 1 M 2 0 M 0 -1 L 0 1 M 1 1 L 2 1 L 0 1 L 0 1 M 0 1 L 2 -1 M 2 1 L 2 1 M 2 1 L 2 1 L 2 0 L 2 -1 M 2 -1 L 2 -1 M 2 -1 L 2 -1 M 2 -1 L 1 -1 M 1 -1 L 0 -1',
                            icon: 'M150 0 L75 200 L225 200 Z',
                            // icon: sharpSignalCellularAlt,
                            onclick: function () {
                                myChart.dispatchAction({
                                    type: "restore",
                                });
                                page.value = Minpage.value
                                jump_to.value = null
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
            myChart.setOption(option);
        }
        // get 最大秒數
        async function SecTopage (url) {
            api_time = await connect_api_time(url)
            console.log(api_time)
            console.log('裡面', Math.round(api_time[1]))
            let second = Math.ceil(api_time[1] / 10)  // ceil 無條件進入
            Maxpage.value = second
        }
        async function SetOption (start, end) {
            const chartDom = document.getElementById("myEcharts");
            var resizeCharDom = function () {
                chartDom.style.width = window.innerWidth - 300 + 'px'
                chartDom.style.height = window.innerHeight * 0.8 + 'px'
            }
            screen_length.value = window.innerWidth - 265
            screen_height.value = window.innerHeight * 0.8
            console.log('screen_length', screen_length.value)
            console.log('screen_height', screen_height.value)
            // 設置div容器高寬
            resizeCharDom()
            console.log('chartDom.style.width', chartDom.style.width)
            console.log('chartDom.style.height', chartDom.style.height)
            myChart = echarts.init(chartDom);
            const series = [];
            api_data = await connect_api(json_url);
            data_len.value = api_data.length;
            // Count Channel number
            let count_channel = [];
            for (let i = 0; i < Object.keys(api_data).length; i++) {
                count_channel.push(i);
            }
            // Get channel name arr
            channel_name_function(channel_array.value, data_len.value, api_data);
            // 將資料合併到save_arr ，format : [time,value] 
            for (let i = 0; i < data_len.value; i++) {
                convert_sec(save_arr, end_time.value, 512 * end_time.value, i, api_data);
            }
            channel_array.value.forEach(function (egg_parameter, idx) {
                // channel_array[idx] , idx = 0 , is F1-C3  ，這裡拆要change
                let de = data_len.value - 1 - idx
                let arr_split = channel_array.value[de].split("");
                for (let l = 0; l < 3; l++) {
                    let conver_number = Number(arr_split[l]);
                    if (!isNaN(conver_number)) {
                        channel_number_arr.push(conver_number);
                        if (conver_number % 2 === 0) {
                            default_color.value = "#1607ed";
                        } else if (conver_number % 2 != 0) {
                            default_color.value = "#ed070f";
                        }
                    }
                }
                if (idx === 0) {
                    default_color.value = "#0c0d0c";
                }
                if (arr_split[1] == 'z') {
                    default_color.value = "#0bb30b";
                }
                series.push({
                    type: "line",
                    name: egg_parameter,
                    data: save_arr[data_len.value - 1 - idx],
                    symbol: "none",
                    smoth: true,
                    color: default_color.value,
                });
            });
            let option = {
                animation: false,
                xAxis: {
                    type: "value",
                    show: true,
                    splitLine: {
                        // 坐標軸分隔線
                        show: true,
                        lineStyle: {
                            color: ["#626366"],
                            width: 0.5,
                            type: "solid",
                            join: "miter",
                        },
                    },
                    axisLabel: {
                        show: true,
                    },
                    min: start,
                    max: end,
                    interval: 1,
                },
                yAxis: {
                    show: false,
                    type: "value",
                    scale: true,
                    axisLabel: {
                        show: true,
                        showMinLabel: true,
                        showMaxLabel: true,
                    },
                    // 網格線
                    splitLine: {
                        show: false,
                    },
                    min: 385 * (-1 * data_len.value),
                    // min: -7315,
                    max: 300,
                },
                series: series,
                grid: {
                    left: "7%",
                    containLabel: false
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
                        saveAsImage: {},
                        mytools: {
                            show: true,
                            title: "Clear",
                            // icon: "M12,0A12,12 0 0,1 24,12A12,12 0 0,1 12,24A12,12 0 0,1 0,12A12,12 0 0,1 12,0M12,2A10,10 0 0,0 2,12C2,14.4 2.85,16.6 4.26,18.33L18.33,4.26C16.6,2.85 14.4,2 12,2M12,22A10,10 0 0,0 22,12C22,9.6 21.15,7.4 19.74,5.67L5.67,19.74C7.4,21.15 9.6,22 12,22Z",
                            icon: sharpSignalCellularAlt,
                            onclick: function () {
                                // myChart.dispatchAction({
                                //     type: "restore",
                                // });
                                // All_data_Option(start_time.value, end_time.value)
                            },
                        },
                        mytools2: {
                            show: true,
                            title: "aaaa",
                            // icon: 'M 0 0 M 0 -1 L 2 1 M 2 0 M 0 -1 L 0 1 M 1 1 L 2 1 L 0 1 L 0 1 M 0 1 L 2 -1 M 2 1 L 2 1 M 2 1 L 2 1 L 2 0 L 2 -1 M 2 -1 L 2 -1 M 2 -1 L 2 -1 M 2 -1 L 1 -1 M 1 -1 L 0 -1',
                            icon: 'M150 0 L75 200 L225 200 Z',
                            // icon: sharpSignalCellularAlt,
                            onclick: function () {
                                myChart.dispatchAction({
                                    type: "restore",
                                });
                                page.value = Minpage.value
                                jump_to.value = null
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
            };
            option && myChart.setOption(option);
            let range_start;
            let range_end;
            let coor_start = ref(0)
            let coor_end = ref(0)
            let coordRange_start = ref(0)
            let corrdRange_end = ref(0)
            var rangeArray = [
                [],
            ]
            // 框選數量有幾個
            let brush_count = ref(0)
            // 儲存時間
            let save_cor_time = []
            function select (params, brushType) {
                console.log('Brushtype', brushType)
                let brushComponent = params.batch[0]
                brush_count.value = params.batch[0].areas.length
                console.log('框選數量', params.batch[0].areas.length)
                //裡面有三筆的話，areas_length -1移除前兩筆(最後一筆不算) (Queue FIFO)
                for (let i = 0; i < brush_count.value - 1; i++) {
                    // console.log(params.batch[0].areas[i])
                    params.batch[0].areas.shift()
                }
                // 判斷X軸是LineX 還是 rect
                if (brushType !== "lineX") {
                    range_start = brushComponent.areas[0].range[0][0];
                    range_end = brushComponent.areas[0].range[0][1];
                } else {
                    range_start = brushComponent.areas[0].range[0];
                    range_end = brushComponent.areas[0].range[1];
                }
                // 再將rnage座標轉作為xy的座標(coordRange的值)
                coordRange_start.value = myChart.convertFromPixel({ seriesIndex: 0 }, [range_start, range_end])[0];
                corrdRange_end.value = myChart.convertFromPixel({ seriesIndex: 0 }, [range_end, range_start])[0];
                // console.log("range_start/end", range_start, range_end);
                console.log('brushComponent', brushComponent)
                console.log("coordRange_start/end", coordRange_start.value, corrdRange_end.value);
                sec_range.value = roundToTwo(coordRange_start.value) + ' s 到 ' + roundToTwo(corrdRange_end.value) + 's';
                // 轉換成筆數存入arr
                coor_start.value = Math.round(coordRange_start.value * 512)
                coor_end.value = Math.round(corrdRange_end.value * 512)
                save_cor_time.push(coor_start.value)
            }
            // watch(coor_start, () => {
            //     console.log('coor_start/end', coor_start.value, coor_end.value)
            // })
            myChart.on('brushSelected', function (params) {
                let brushComponent = params.batch[0]
                if (brushComponent.areas[0] !== undefined) {
                    let type = brushComponent.areas[0].brushType;
                    select(params, type);
                    console.log('list 有多少', save_cor_time)
                    console.log('conoutlist ', save_cor_time.length)
                    rangeArray[0].push({
                        // 用筆數來畫
                        start: coor_start.value,
                        end: coor_end.value
                    })
                    // 做了兩次框選後，最新的值肯定不等於前一筆，同時如果brush_count還是只有框一個時，表示同一個rect一值重複框選
                    if (save_cor_time.length > 1) {
                        if (save_cor_time[0] != save_cor_time[1] && brush_count.value === 1) {
                            // console.log('hh', save_cor_time.length)
                            // console.log('hh2', rangeArray)
                            rangeArray[0].shift()
                            timeline(screen_length.value, 1, 1, rangeArray)
                        }
                    }
                    timeline(screen_length.value, 1, 1, rangeArray)
                    watch(brush_count, () => {
                        console.log('brush_count結束', brush_count.value)
                    })
                }
            })
            console.log('rangeArray', rangeArray)
            var canvas = document.getElementById("canvas")
            canvas.width = 200
            canvas.height = screen_height.value
            var ctx = canvas.getContext('2d')
            ctx.font = '15px serif';
            channel_array.value.forEach(function (channel_name, idx) {
                // console.log(channel_name)
                //8.35   越大整體越縮小
                ctx.fillText(channel_name, 10, (idx * 295) / 8 + 10);
            })
            var canvas2 = document.getElementById("canvas2")
            canvas2.width = 1900
            canvas2.height = 120
            var I = canvas2.getContext('2d')
            I.beginPath()
            I.lineWidth = 3
            I.strokeStyle = "#2d14e3"
            I.fillStyle = "#2d3e6e"
            /*使用rect(x,y,w,h)繪製四角形
            x,y一樣是座標，w和h是四邊形的寬和高*/
            I.rect(screen_length.value - 380, 40, 10, 17);
            I.fill()
            I.stroke()
            I.font = '15px self'
            I.fillText('200uv', screen_length.value - 365, 55)
            // DerawTimeLine
            timeline(screen_length.value, 1, 1, rangeArray)
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
        onBeforeMount(() => {
            console.log('onBeforeMount')
            SecTopage(time_url)
        })
        onBeforeUnmount(() => {
            if (timer !== void 0) {
                clearTimeout(timer)
                $q.loading.hide()
            }
        })
        onMounted(() => {
            SetOption(start_time.value, end_time.value);
        });
        return {
            page, Minpage, Maxpage, api_time, jump_to,
            pre_button, next_button, dynamic_10sdata,
            start_time, end_time, send_page,
            sec_range
        }
    },
};
</script>
<style scoped>
.q-pb-lg flex flex-center {
    padding-left: 10px;
    padding-right: 10px;
}
.charts {
    display: flex;
}
</style>