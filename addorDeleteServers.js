const action = process.argv[2];
const serverName = process.argv[3]; 
const  { createClient } =   require('redis');
const client = createClient();
client.connect();
const main = async () =>{
    try {   
        if(action == 'delete'){
            const keyData = JSON.parse(await client.get('servers'));
            if(keyData && keyData.indexOf(serverName) != -1){
                await client.set('servers',JSON.stringify(keyData.splice(keyData.indexOf(serverName),1)))
            }

            console.log(serverName + ' is deleted to server list');
            process.exit(0);
        }
        
        if(action == 'add'){

            const keyData = JSON.parse(await client.get('servers'));
            if(keyData && keyData.indexOf(serverName) == -1){
                await client.set('servers',JSON.stringify([...keyData,serverName]));
            }else{
                await client.set('servers',JSON.stringify([serverName]));
            }
            console.log(serverName + ' is added to server list');
            process.exit(0);
        }
    } catch (error) {
        console.log("Error ocurred unable to perform action",error);
        process.exit(1);
            
    }
}
main();
    
    
