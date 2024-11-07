import { create } from "ipfs-http-client";

// Replace these with your Infura Project ID and Secret
const projectId = "85de5f615aa44e5a9381fca701ae43b1";
const projectSecret = "D6PUijDTNJWx6b3HeDZIhAJ3PSV4IcngefAsWJfv8fkrAlcEWIwJpg";

// Construct authorization header
const auth = "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

const ipfs = create({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
    headers: {
        authorization: auth,
    },
});

// Now you can use this `ipfs` instance to interact with IPFS.
