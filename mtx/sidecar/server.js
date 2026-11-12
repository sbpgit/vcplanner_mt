const cds = require('@sap/cds')

cds.once('served', async () => {
  const provisioning = await cds.connect.to('cds.xt.SaasProvisioningService')
  provisioning.prepend(srv => {
    srv.on('dependencies', () => {
      return [
        { xsappname: 'clone4cb226b5cbae4cafa9e809aae6544eb9!b725820|destination-xsappname!b62' }
      ]
    })
  })
})

// cds.once('served', async () => {
//   const provisioning = await cds.connect.to('cds.xt.SaasProvisioningService')

//   const vcapServices = JSON.parse(process.env.VCAP_SERVICES || '{}')

//   const destinationService = vcapServices.destination?.[0]

//   const xsappname = destinationService?.credentials?.xsappname
//   if (!xsappname) {
//     throw new Error('Destination xsappname not found in VCAP_SERVICES')
//   }

//   provisioning.prepend(srv => {
//     srv.on('dependencies', () => {
//       return [{ xsappname }]
//     })
//   })
// })

//Get xsappname from cf env vcplanner_mt-mtx | grep -A 20 '"destination"'

          

cds.on('served', () => {
  const deploymentService = cds.services['cds.xt.DeploymentService'];
  if (!deploymentService) return;

  deploymentService.after('subscribe', async (_, req) => {
    const data = req.data || {};
    const tenantId = data.tenant || data.subscribedTenantId || req.params?.[0]?.tenant;
    if (!tenantId) throw new Error('Could not determine subscriber tenant ID');

    let metadata = data.metadata || {};
    if (typeof metadata === 'string') {
      try { metadata = JSON.parse(metadata); } catch { metadata = {}; }
    }
    const payload = metadata.subscriptionPayload || metadata;

    const subscriber = {
      tenantId: payload.subscribedTenantId || tenantId,
      customerName: payload.subscribedSubdomain || null
    };

    let licensing;
    try {
      licensing = await cds.connect.to('licensing');
    } catch (e) {
      console.error('[LICENSE] connect failed:', e.stack);
      return;
    }
    console.log('[LICENSE] kind:', licensing.options?.kind);

    try {
      const result = await licensing.send({
        method: 'POST',
        path: '/registerSubscriber',
        data: subscriber,
        headers: { 'content-type': 'application/json' }
      });
      console.log('[LICENSE] registered:', result);
    } catch (e) {
      console.error('[LICENSE] register failed:', e.stack);
    }
  });

  deploymentService.after('unsubscribe', async (_, req) => {
    const data = req.data || {};
    console.log("DATA", data);
    const tenantId = data.tenant || data.subscribedTenantId || req.params?.[0]?.tenant;
    if (!tenantId) throw new Error('Could not determine subscriber tenant ID');

    console.log("tenantId", tenantId);

    // let metadata = data.metadata || {};
    // if (typeof metadata === 'string') {
    //   try { metadata = JSON.parse(metadata); } catch { metadata = {}; }
    // }
    // const payload = metadata.subscriptionPayload || metadata;

    // console.log("payload", payload);

    const subscriber = {
      // tenantId: payload.subscribedTenantId || tenantId,
      // customerName: payload.subscribedSubdomain
      tenantId : tenantId
    };

    let licensing;
    try {
      licensing = await cds.connect.to('licensing');
    } catch (e) {
      console.error('[LICENSE] connect failed:', e.stack);
      return;
    }
    console.log('[LICENSE] kind:', licensing.options?.kind);

    try {
      const result = await licensing.send({
        method: 'POST',
        path: '/UnSubscribeUser',
        data: subscriber,
        headers: { 'content-type': 'application/json' }
      });
      console.log('[LICENSE] unsubscribe:', result);
    } catch (e) {
      console.error('[LICENSE] unsubscribe failed:', e.stack);
    }
  });
});

module.exports = cds.server;
