const express = require('express');
const app = express()
const  { createClient } =   require('redis');
const client = createClient();
client.connect();
const healthCheck = require('./healthCheck');
const axios  = require('axios');
let current = 0;
healthCheck(client);
const requestHandler = async (req, res) => {
    servers = await client.get('servers');
    servers = JSON.parse(servers);
    const { method, url, headers, body: data } = req
    server = servers[current];
    current === (servers.length
         - 1) ? current = 0 : current++;
    if(!server){
        current = 0;
        return res.status(500).send('Something went wrong')
    }
    try {
        const response = await axios({
        url: `${server}${url}`,
        method,
        headers,
        data
        })
        res.send(response.data)
    }
    catch (err) {
        requestHandler(req, res)
    }
}
app.use(async (req, res) => {
    requestHandler(req,res)
})
app.listen(80)
    