const { MongoClient } = require('mongodb');

async function printAllCollectionsDetails() {
    const uri = "mongodb+srv://melosryz:tgGnHlyxTWSRQvzM@cluster0.lf0wr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; // Replace with your MongoDB URI
    const client = new MongoClient(uri, { useUnifiedTopology: true });

    try {
        await client.connect();
        const db = client.db("mytesting"); // Replace with your database name

        // List all collections in the database
        const collections = await db.listCollections().toArray();
        
        for (let collection of collections) {
            console.log(`\nCollection Name: ${collection.name}`);
            console.log('Collection Info:', collection);

            // Fetch all documents in the collection
            const documents = await db.collection(collection.name).find().toArray();
            console.log('Documents:', documents);

            // Get stats for the collection
            const stats = await db.collection(collection.name).stats();
            console.log('Stats:', {
                documentCount: stats.count,
                dataSize: stats.size,
                storageSize: stats.storageSize,
                indexCount: stats.nindexes,
                indexDetails: stats.indexSizes,
                avgDocumentSize: stats.avgObjSize,
            });
        }
    } catch (error) {
        console.error('Error printing collection details:', error);
    } finally {
        await client.close();
    }
}

printAllCollectionsDetails();
