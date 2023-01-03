const myCache = require('./cache');
const axios = require('axios');;
const checkHealth = async (client) => {
    setInterval( async () => {
        const servers = JSON.parse(await client.get('servers'));
        console.log('servers :>> ', servers);
        if(servers){
            servers.forEach(async (url,index) => {
                try {
                    await axios.get(url);
                    console.log('healthCheck passed :>> ', url);

                } catch (error) {
                    console.log('healthCheck failed :>> ', url);

                    servers.splice(index,1)
                    await client.set('servers',JSON.stringify(servers));
                }
            });
        }
    }, 30000);
}

module.exports = checkHealth