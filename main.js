const axios = require("axios")
const User = require("./models/users")
const {MongoClient} = require('mongodb');
const { reset } = require('nodemon');

async function main() {
    const url = "mongodb+srv://Summaries_Vipara123:Pxgamer22@cluster0.i4eya.mongodb.net/?retryWrites=true&w=majority";

    const client = new MongoClient(url);

    try { 
        await client.connect();

        await createMultipleListings(client,[
            {
                username: "Viput",
                email: "Viput123@gmail.com",
                password: "12345"
            },
            {
                username: "BIGP",
                email: "Bipg23@gmail.com",
                password: "12445"
            }
        ])

    } catch(e){
        console.error(e);

    } finally {
        await client.close();
    }
    
}

async function createMultipleListings(client, newListings) {
    const result = await client.db("DatabaseTest").collection("Brab").insertMany(newListings);

    console.log(`${result.insertedCount} new listings create with the follow id (s):`);
    console.log(result.insertedIds);
}

