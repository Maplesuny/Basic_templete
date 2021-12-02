<template>
    <div class="echarts-box">
        <div
            id="myEcharts"
            :style="{
                width: '1500px',
                height: 44 * channel_array.length + 100 + 'px',
            }"
        ></div>
    </div>
</template>

<script>
import { onMounted, ref } from "vue";
import * as echarts from "echarts";
import json from "assets/Fp1_A1_0_20s.json";
export default {
    setup () {
        const start_time = ref(0);
        const end_time = ref(10);
        const montage_type = ref(0);
        const channel_array = ref([]);
        const channel_length = ref(0);

        let select_start = ref(0);
        let select_end = ref(0);
        let ss_ing = ref("");
        let range_start;
        let range_end;

        let color = ref("#3a3c42");

        channel_length.value = json.length;

        // // 取得目前寬度，每次刷新比例會適中
        let get_width = document.documentElement.clientWidth;
        let fixed_ = ref("");
        fixed_.value = get_width - 250 + "px";

        // get channel name
        for (let i = 0; i < channel_length.value; i++) {
            channel_array.value.push(json[i]["id"]);
        }

        // 取出channel前面數字儲存
        let channel_number_arr = [];
        // for(let k=0;k<channel_length.value;k++){
        //     let arr_split = channel_array.value[k].split("")
        //     for(let l=0 ;l<3;l++){
        //         if(!isNaN(Number(arr_split[l]))){
        //             channel_number_arr.push(Number(arr_split[l]))
        //         }
        //     }
        // }

        // console.log('channel_number_arr',channel_number_arr)

        // Count Channel number
        let count_channel = [];
        for (let i = 0; i < Object.keys(json).length; i++) {
            count_channel.push(i);
        }

        // 將數量換算成秒 ,number : 有幾筆資料
        function Convert_sec (number) {
            const dataArray = [];
            // 基底
            let base = end_time.value / number;
            let sum = 0;
            for (let i = 0; i < number; i++) {
                sum = sum + base;
                dataArray.push(sum);
            }
            return dataArray;
        }

        function SetOption (start, end) {
            const chartDom = document.getElementById("myEcharts");
            const myChart = echarts.init(chartDom);

            const title = [];
            const xAxis = [];
            const yAxis = [];
            const grid = [];
            const series = [];
            const res = json; // 方便轉換axios

            //   console.log(res[0]['id'])

            channel_array.value.forEach(function (eeg_parameter, idx) {
                console.log("idx", idx);
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

                if (res[idx]["id"] === "ECG") {
                    color.value = "#0d0000";
                }

                if (idx != channel_length.value - 1) {
                    title.push({
                        id: idx,
                        textBaseline: "middle",
                        top: (idx * 360) / 8.2 + 50 + "px",
                        left: "1%",
                        text: res[idx]["id"],
                    });
                    xAxis.push({
                        show: false,
                        // name: 'time (sec)',
                        type: "category",
                        boundaryGap: false,
                        data: Convert_sec(512 * end_time.value),
                        gridIndex: idx,
                        min: 512 * start,
                        max: 512 * end,
                        splitNumber: 2,
                        // minorTick: {
                        //     // 顯示刻度線
                        //     show: true,
                        //     splitNumber: 1,
                        //     length: 15
                        // },
                    });
                    yAxis.push({
                        show: false,
                        type: "value",
                        scale: true,
                        gridIndex: idx,
                        // 隱藏網格線
                        splitLine: {
                            show: true,
                        },
                        yAxisIndex: idx,
                    });
                    grid.push({
                        height: "30px",
                        top: (idx * 360) / 8.2 + 35 + "px",
                        left: "7%",
                        right: "5%",
                        containLabel: false,
                    });
                    series.push({
                        type: "line",
                        data: res[idx]["value"],
                        // 去掉小圓點
                        symbol: "none",
                        color: color.value,
                        smooth: true,
                        xAxisIndex: idx,
                        yAxisIndex: idx,
                    });
                } else {
                    title.push({
                        id: idx,
                        textBaseline: "middle",
                        top: (idx * 360) / 8.2 + 50 + "px",
                        left: "1%",
                        text: res[idx]["id"],
                        bottom: "20",
                    });
                    xAxis.push({
                        show: true,
                        name: "time (sec)",
                        type: "category",
                        boundaryGap: false,
                        data: Convert_sec(512 * end_time.value),
                        gridIndex: idx,
                        min: 512 * start,
                        max: 512 * end,
                        // axisTick: {
                        //     alignWithLabel: true
                        // },
                        interval: 0,
                        // axisLabel: {
                        //     interval: 0,//代表显示所有x轴标签显示

                        // },
                        // interval: 1,
                        // minorTick: {
                        //     // 顯示刻度線
                        //     show: true,
                        //     splitNumber: 1,
                        //     length: 15
                        // },
                        minorSplitLine: {
                            show: true
                        },

                        // axisTick: {
                        //     show: false,
                        //     interval: 1,
                        // },
                        // axisLabel: {
                        //     show: true,
                        //     interval: 0,
                        // },
                    });
                    yAxis.push({
                        show: false,
                        type: "value",
                        scale: true,
                        gridIndex: idx,
                        // 隱藏網格線
                        splitLine: {
                            show: true,
                        },
                    });
                    grid.push({
                        height: "30px",
                        top: (idx * 360) / 8.2 + 35 + "px",
                        left: "7%",
                        right: "5%",
                        containLabel: false,
                    });
                    series.push({
                        type: "line",
                        data: res[idx]["value"],
                        symbol: "none",
                        color: color.value,
                        smooth: true,
                        xAxisIndex: idx,
                        yAxisIndex: idx,
                    });
                }

                let option = {
                    title: title,
                    xAxis: xAxis,
                    yAxis: yAxis,
                    grid: grid,
                    series: series,
                    dataZoom: [
                        {
                            type: "inside",
                            xAxisIndex: count_channel,
                            // zoomOnMouseWheel: 'alt'
                        },
                        {
                            type: "slider",
                            startValue: 0,
                            handleIcon:
                                "M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z",
                            textStyle: {
                                height: 0.5,
                                color: "rgba(160, 25, 25, 1)",
                            },
                        },
                    ],
                    tooltip: {
                        trigger: "axis",
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
                };

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
                    console.log("range_start", range_start);
                    console.log("range_end", range_end);

                    // 再將rnage座標轉作為xy的座標(coordRange的值)
                    let coordRange_start = myChart.convertFromPixel({ seriesIndex: 0 }, [
                        range_start,
                    ])[0];
                    let corrdRange_end = myChart.convertFromPixel({ seriesIndex: 0 }, [
                        range_end,
                        ``,
                    ])[0];

                    console.log("coordRange_start", coordRange_start);
                    console.log("corrdRange_end", corrdRange_end);

                    // 因為取出的座標是點數，要除上總點數，1秒512個點，有幾秒要乘上去
                    select_start.value =
                        (coordRange_start / (512 * end_time.value)) * end_time.value;
                    select_end.value =
                        (corrdRange_end / (512 * end_time.value)) * end_time.value;


                    ss_ing.value =
                        "Rect Range of :" +
                        select_start.value +
                        " second 到 " +
                        select_end.value +
                        " second";
                    console.log("ss_ing", ss_ing.value);

                    let aa = option.title[0];
                    console.log(aa);
                }

                myChart.on("brushSelected", function (params) {
                    let brushComponent = params.batch[0];
                    console.log("brushComponent", brushComponent);
                    if (brushComponent.areas[0] !== undefined) {
                        let type = brushComponent.areas[0].brushType;
                        select_brushType(params, type);
                    }
                });

                option && myChart.setOption(option);
            });
        }

        onMounted(() => {
            SetOption(start_time.value, end_time.value);
        });

        return {
            channel_array,
            ss_ing,
            select_start, select_end
        };
    },
};
</script>
<style scoped>
.echarts-box {
    display: flex;
}
</style>
