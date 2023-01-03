const express = require('express');
const app = express()
const  { createClient } =   require('redis');
const client = createClient();
client.connect();
const healthCheck = require('./healthCheck');
const axios  = require('axios');
let current = 0;
healthCheck(client);   
const serverRetry = {}; 
const requestHandler = async (req, res) => {
    servers = await client.get('servers');
    servers = JSON.parse(servers);
    const { method, url, headers, body: data } = req
    server = servers[current];
    console.log('servers :>> ', servers,server);

    current === (servers.length
         - 1) ? current = 0 : current++;
    if(!server){
        current = 0;
        if(servers.length == 0){
            return res.status(500).send('OOps no server running currently.')
        }else{
            requestHandler(req,res);
        }
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
        if(!serverRetry[url]){
            serverRetry[url] = 1;
        }
        serverRetry[url] += 1;
        if(serverRetry[url] < 5){
            requestHandler(req, res);
        }else{
            serverRetry[url] = 0;
            if(servers.indexOf(url) != -1){
                servers.splice(servers.indexOf(url),1);
                await client.set('servers',JSON.stringify(servers));
                return res.status(500).send('Something went wrong')
            }
  
        }
    }
}
app.use(async (req, res) => {
    requestHandler(req,res)
})
app.listen(80)
    