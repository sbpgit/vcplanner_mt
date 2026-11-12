const cds = require('@sap/cds');
const { default: axios } = require('axios');

const licenseCache = new Map();

const jwt = require("jsonwebtoken");
const LICENSE_SERVICE_URL =
    process.env.LICENSE_SERVICE_URL;

// const AUTH_URL = "https://vcpprovider-sc0jeojq.authentication.us10.hana.ondemand.com"
// const CLIENT_ID = "sb-central_licensing-SBPBTP_vcpprovider-sc0jeojq-dev!t94427";
// const CLIENT_SECRET = "a55068df-8f41-4d66-9230-56087edbc4f5$2jTHRPK3porLf3pODhgNZRbL6vTIFU8ZLrn-8aJNogM=";
// const API_URL = "https://sbpbtp-vcpprovider-sc0jeojq-dev-central-licensing-srv.cfapps.us10.hana.ondemand.com/licensing";


async function fetchLicense(tenantId) {
    const service= await cds.connect.to('licensing')

const response = await service.send({
    method: "GET",
    path: `/validateLicense(tenantId='${tenantId.replace(/'/g, "''")}')`,
    headers: {
        accept: "application/json"
    }
});

    

// const response = await db.get('/validateLicense(tenantId=${encodeURIComponent(tenantId)}');

console.log("License validation response: ", response);



//    const credentials = Buffer
//         .from(`${CLIENT_ID}:${CLIENT_SECRET}`)
//         .toString("base64");

//     const response = await axios.post(
//         `${AUTH_URL.replace(/\/$/, "")}/oauth/token`,
//         new URLSearchParams({
//             grant_type: "client_credentials"
//         }).toString(),
//         {
//             headers: {
//                 Authorization: `Basic ${credentials}`,
//                 "Content-Type": "application/x-www-form-urlencoded",
//                 Accept: "application/json"
//             },
//             timeout: 15000
//         }
//     );

//     let token = response.data.access_token;


//      const url =
//         `${API_URL.replace(/\/$/, "")}/validateLicense` +
//         `(tenantId=${encodeURIComponent(tenantI)})`;

//     try {
//         const response = await axios.get(url, {
//             headers: {
//                 Authorization: `Bearer ${token}`,
//                 Accept: "application/json"
//             },
//             timeout: 15000
//         });

//         return response.data;

//     } catch (error) {
//         console.log(error)
//     }



    if (response.valid == false) {
        throw new Error(
            `License service failed: ${response.valid}`
        );
    }

    return response;
    // return response.json();
}

function getTenantId(req) {

      const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new Error("Authorization header not found");
  }
  const jwtaccessToken = authHeader.replace("Bearer ", "");
  const jwtpayload = jwt.decode(jwtaccessToken);
  const Subdomain = jwtpayload?.ext_attr?.subaccountid;
  if (!Subdomain) {
    throw new Error("Subdomain not found in JWT");
  }

    // Use only a trusted, authenticated tenant context.
    // Verify the exact API available in your CAP version
    // and deployment environment.

    return Subdomain;
}


async function validateTenantLicense(tenantId) {
    const now = Date.now();
    let cached = licenseCache.get(tenantId);

     console.log("Tenant ID:", tenantId);
    console.log("Cached entry exists:", !!cached);
    console.log("Cached expiry:", cached?.expiresAt);
    console.log("Current time:", now);
    console.log("Cache is valid:", !!cached && cached.expiresAt > now);

    if (cached && cached.expiresAt > now) {
        console.log("Returning cached license result");
        return cached.result;
    }

    console.log("Cache miss or expired; calling fetchLicense");

    const result = await fetchLicense(tenantId);

    const expiresAt = result.valid_to;
    if (expiresAt > now) {
        licenseCache.set(tenantId, {
            result,
            expiresAt
        });
    }

    return result;
}


module.exports = {
    fetchLicense,
    getTenantId,
    validateTenantLicense
};