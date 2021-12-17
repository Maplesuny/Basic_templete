import { ref } from 'vue'
import axios from 'axios'
export default function option_function () {

    // 連線Data
    async function connect_api (api_url) {
        return await axios.get(api_url).then((res) => {
            let data = res.data
            return data
        }).catch((err) => {
            alert('連線失敗')
            console.log('Error Message :', err)
        })
    }

    async function connect_api_time (url) {
        return await axios.get(url).then((res) => {
            let data_time_list = res.data
            return data_time_list
        }).catch((err) => {
            alert('api time 連線失敗')
        })
    }

    // 取得channel 名稱
    function channel_name_function (arr, arr_length, data) {
        for (let i = 0; i < arr_length; i++) {
            arr.push(data[i]['id'])
        }
        return arr
    }

    // 資料與秒數合併 ==> arr[秒數,資料]
    function convert_sec (arr, end_time, number, idx, data) {
        const base = end_time / number
        const list_array = []
        let sum = 0
        for (let i = 0; i < number; i++) {
            sum = sum + base
            list_array.push([sum, data[idx]['value'][i] - 400 * idx])
        }
        arr.push(list_array)
        return arr
    }

    //dynamic_10sdata用
    function convert_sec2 (arr, start_time, end_time, idx, data) {

        // 總筆數
        let total_number = end_time * 512
        // 將筆數換為秒數
        let conver = end_time / total_number
        let conver_arr = []
        let sum = 0
        for (let i = 0; i < total_number; i++) {
            sum = sum + conver
            conver_arr.push([sum, data[idx]['value'][i] - 400 * idx])
        }
        // 要扣掉的筆數,
        console.log('look', start_time, end_time)
        let delete_number = start_time * 512
        // console.log(delete_number)
        if (delete_number === 0) {
            console.log(conver_arr)
            arr.push(conver_arr)
        } else {
            for (let j = 0; j < delete_number; j++) {
                // 從頭開始移除
                // conver_arr.shift()
                // 從後面移除
                conver_arr.pop()
            }
            arr.push(conver_arr)
        }

        return arr
    }

    // 小數點後兩位
    function roundToTwo (num) {
        return +(Math.round(num + "e+2") + "e-2");
    }


    return {
        connect_api, connect_api_time,
        channel_name_function, convert_sec, convert_sec2,
        roundToTwo

    }
}