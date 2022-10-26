const axios = require("axios")

async function doHeadRequest() {

    let payload = {name : 'Char 123' , Occuption: 'Gardner'}
    let res = await axios.post('http://httpbin.org/post', payload)

    let data = res.data;
    console.log(data);
}
  
doHeadRequest();