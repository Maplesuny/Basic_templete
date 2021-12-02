<template>
    <q-page-container>
        <div class="echarts-box">
            <div id="myEcharts" :style="styleobject"></div>
        </div>
    </q-page-container>
</template>

<script>
import * as echarts from "echarts";
import { onMounted, ref } from "vue";
export default {
    setup () {
        let ddddat = ref([]);
        let dddday = ref([]);
        let ww = document.documentElement.clientWidth
        let fixed_ = ref("")

        fixed_.value = ww - 5 + 'px'
        onMounted(() => {
            const chartDom = document.getElementById("myEcharts");
            const myChart = echarts.init(chartDom);
            let option;

            option = {
                tooltip: {
                    trigger: "axis",
                    axisPointer: {
                        type: "shadow",
                    },
                },
                grid: {
                    left: "3%",
                    right: "4%",
                    bottom: "3%",
                    containLabel: true,
                },
                xAxis: [
                    {
                        type: "category",
                        data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                        axisTick: {
                            alignWithLabel: true,
                        },
                    },
                ],
                yAxis: [
                    {
                        type: "value",
                    },
                ],
                series: [
                    {
                        name: "Direct",
                        type: "bar",
                        barWidth: "60%",
                        data: [10, 52, 200, 334, 390, 330, 220],
                    },
                ],
                toolbox: {
                    right: 10,
                    feature: {
                        dataZoom: {
                            yAxisIndex: "none",
                        },
                        restore: {},
                        saveAsImage: {},
                        mytools: {
                            show: true,
                            title: "Nick",
                            icon: "M12,0A12,12 0 0,1 24,12A12,12 0 0,1 12,24A12,12 0 0,1 0,12A12,12 0 0,1 12,0M12,2A10,10 0 0,0 2,12C2,14.4 2.85,16.6 4.26,18.33L18.33,4.26C16.6,2.85 14.4,2 12,2M12,22A10,10 0 0,0 22,12C22,9.6 21.15,7.4 19.74,5.67L5.67,19.74C7.4,21.15 9.6,22 12,22Z",
                            onclick: function () {
                                // alert(ddddat.value[0]);
                                // myChart.dispatchAction({
                                //   type: "brush",
                                //   areas: [
                                //     {
                                //       brushType: "rect",
                                //       range: [],
                                //     },
                                //   ],
                                // });
                            },
                        },
                    },
                },
                brush: {
                    id: "brush",
                    geoIndex: "all",
                    seriesIndex: "all",
                    brushLink: "all",
                    toolbox: ["rect", "keep", "lineX", "clear"],
                    inBrush: {
                        opacity: 1,
                        symbolSize: 20,
                    },
                    removeOnClick: false,
                    // 調整是否可平移
                    transformable: true,
                    throttleType: "debounce",
                    throttleDelay: 1000,
                    //   brushMode: 'multiple',
                    brushStyle: {
                        borderWidth: 3,
                        color: "rgba(245,39,56,0)",
                        borderColor: "rgba(220,20,57,0.8)",
                    },
                },
                dataZoom: [
                    {
                        type: "inside",
                        moveOnMouseMove: false,
                    },
                ],
            };
            option && myChart.setOption(option);
        });
        return {
            ddddat, dddday,
            styleobject: {
                width: fixed_.value,
                height: '300px'
            }
        };
    },

    watch: {
        "styleobject.width": function () {
            console.log('dfdd')
        }
    }
};
</script> 